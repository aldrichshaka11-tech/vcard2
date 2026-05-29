import logging
import os
import re

from flask import Blueprint, request
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from config.db import get_db
from utils import json_resp, json_error

logger = logging.getLogger(__name__)
auth_bp = Blueprint("auth", __name__)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


def _generate_slug(name: str, db) -> str:
    base = re.sub(r"[^a-zA-Z0-9]+", "-", name.strip()).strip("-").lower()
    if not base:
        base = "user"
    slug = base
    i = 1
    while True:
        with db.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE slug = %s", (slug,))
            if not cur.fetchone():
                break
        slug = f"{base}-{i}"
        i += 1
    return slug



@auth_bp.route("/me", methods=["GET"])
def me():
    from utils import require_auth
    @require_auth
    def _inner(identity):
        db = get_db()
        try:
            with db.cursor() as cur:
                cur.execute(
                    "SELECT id, name, email, slug, role, plan_status, plan_expires_at, avatar "
                    "FROM users WHERE id = %s AND is_active = 1",
                    (identity["user_id"],),
                )
                user = cur.fetchone()
            if not user:
                return json_error(404, "User not found.")
            
            # Check if claims in the JWT token mismatch the database record
            token_needs_refresh = (
                identity.get("role") != user["role"] or
                identity.get("plan_status") != user["plan_status"] or
                identity.get("slug") != user["slug"]
            )
            
            resp_data = {"user": {
                "id":             user["id"],
                "name":           user["name"],
                "email":          user["email"],
                "slug":           user["slug"],
                "role":           user["role"],
                "plan_status":    user["plan_status"],
                "plan_expires_at": str(user["plan_expires_at"]) if user["plan_expires_at"] else None,
                "avatar":         user["avatar"],
            }}
            
            if token_needs_refresh:
                new_token = create_access_token(
                    identity=str(user["id"]),
                    additional_claims={
                        "slug":        user["slug"],
                        "role":        user["role"],
                        "plan_status": user["plan_status"],
                    }
                )
                resp_data["token"] = new_token
                
            return json_resp(200, resp_data)
        except Exception:
            logger.exception("me failed")
            return json_error(500, "Failed to fetch user.")
        finally:
            db.close()
    return _inner()


@auth_bp.route("/register", methods=["POST"])
def register():
    body  = request.get_json(silent=True) or {}
    name  = body.get("name",  "").strip()
    email = body.get("email", "").strip()
    password = body.get("password", "")

    if not name or not email or not password:
        return json_error(422, "Name, email, and password are required.")
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return json_error(422, "Invalid email address.")
    if len(password) < 6:
        return json_error(422, "Password must be at least 6 characters.")

    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                return json_error(409, "Email already registered.")

            slug   = _generate_slug(name, db)
            hashed = generate_password_hash(password, method="pbkdf2:sha256")

            cur.execute(
                "INSERT INTO users (name, email, password, slug, role, plan_status) "
                "VALUES (%s, %s, %s, %s, 'basic', NULL)",
                (name, email, hashed, slug),
            )
            user_id = cur.lastrowid

        token = create_access_token(
            identity=str(user_id),
            additional_claims={"slug": slug, "role": "basic", "plan_status": None}
        )
        return json_resp(201, {
            "token": token,
            "user": {
                "id": user_id, "name": name, "email": email,
                "slug": slug, "role": "basic", "plan_status": None,
            },
        })
    except Exception:
        logger.exception("register failed email=%s", email)
        return json_error(500, "Registration failed. Please try again.")
    finally:
        db.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    body  = request.get_json(silent=True) or {}
    email = body.get("email", "").strip()
    password = body.get("password", "")

    if not email or not password:
        return json_error(422, "Email and password are required.")

    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "SELECT id, name, email, password, slug, role, plan_status, plan_expires_at, avatar "
                "FROM users WHERE email = %s AND is_active = 1",
                (email,),
            )
            user = cur.fetchone()

        try:
            stored = user["password"] if user else ""
            if stored.startswith("$2y$") or stored.startswith("$2b$"):
                password_valid = check_password_hash(stored.replace("$2y$", "$2b$", 1), password)
            elif stored.startswith(("pbkdf2:", "scrypt:")):
                password_valid = check_password_hash(stored, password)
            else:
                password_valid = stored == password
        except ValueError:
            password_valid = False
        if not password_valid:
            return json_error(401, "Invalid email or password.")

        # Auto-upgrade plain text or PHP hash to pbkdf2 on login
        if user and not user["password"].startswith(("pbkdf2:", "scrypt:")):
            try:
                new_hash = generate_password_hash(password, method="pbkdf2:sha256")
                with db.cursor() as cur:
                    cur.execute("UPDATE users SET password = %s WHERE id = %s", (new_hash, user["id"]))
            except Exception:
                pass

        token = create_access_token(
            identity=str(user["id"]),
            additional_claims={
                "slug":        user["slug"],
                "role":        user.get("role", "basic"),
                "plan_status": user.get("plan_status"),
            }
        )
        return json_resp(200, {
            "token": token,
            "user": {
                "id":             user["id"],
                "name":           user["name"],
                "email":          user["email"],
                "slug":           user["slug"],
                "role":           user.get("role", "basic"),
                "plan_status":    user.get("plan_status"),
                "plan_expires_at": str(user["plan_expires_at"]) if user.get("plan_expires_at") else None,
                "avatar":         user.get("avatar"),
            },
        })
    except Exception:
        logger.exception("login failed email=%s", email)
        return json_error(500, "Login failed. Please try again.")
    finally:
        db.close()


@auth_bp.route("/google", methods=["POST"])
def google_login():
    body     = request.get_json(silent=True) or {}
    token    = body.get("credential", "")
    userInfo = body.get("userInfo", {})

    if not token or not userInfo:
        return json_error(422, "Google credential is required.")

    email = userInfo.get("email", "").strip()
    name  = userInfo.get("name",  "").strip() or email.split("@")[0]

    if not email:
        return json_error(422, "Could not get email from Google account.")

    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "SELECT id, name, email, slug, role, plan_status, avatar FROM users WHERE email = %s AND is_active = 1",
                (email,),
            )
            user = cur.fetchone()

        if not user:
            slug   = _generate_slug(name, db)
            hashed = generate_password_hash(os.urandom(32).hex(), method="pbkdf2:sha256")
            with db.cursor() as cur:
                cur.execute(
                    "INSERT INTO users (name, email, password, slug, role, plan_status) "
                    "VALUES (%s, %s, %s, %s, 'basic', NULL)",
                    (name, email, hashed, slug),
                )
                user_id = cur.lastrowid
            user = {"id": user_id, "name": name, "email": email,
                    "slug": slug, "role": "basic", "plan_status": None, "avatar": None}

        token_jwt = create_access_token(
            identity=str(user["id"]),
            additional_claims={
                "slug":        user["slug"],
                "role":        user.get("role", "basic"),
                "plan_status": user.get("plan_status"),
            }
        )
        return json_resp(200, {
            "token": token_jwt,
            "user": {
                "id":          user["id"],
                "name":        user["name"],
                "email":       user["email"],
                "slug":        user["slug"],
                "role":        user.get("role", "basic"),
                "plan_status": user.get("plan_status"),
                "avatar":      user.get("avatar"),
            },
        })
    except Exception:
        logger.exception("google_login failed email=%s", email)
        return json_error(500, "Google login failed. Please try again.")
    finally:
        db.close()


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    body = request.get_json(silent=True) or {}
    email = body.get("email", "").strip()

    if not email:
        return json_error(422, "Email is required.")

    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "SELECT id FROM users WHERE email = %s AND is_active = 1",
                (email,),
            )
            user = cur.fetchone()
        
        if not user:
            return json_error(404, "No account found with this email.")

        return json_resp(200, {
            "message": "Email verified successfully."
        })
    except Exception:
        logger.exception("forgot_password failed email=%s", email)
        return json_error(500, "An error occurred. Please try again.")
    finally:
        db.close()


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    body = request.get_json(silent=True) or {}
    email = body.get("email", "").strip()
    new_password = body.get("new_password", "").strip()

    if not email or not new_password:
        return json_error(422, "Email and new password are required.")

    if len(new_password) < 6:
        return json_error(422, "Password must be at least 6 characters.")

    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "SELECT id FROM users WHERE email = %s AND is_active = 1",
                (email,),
            )
            user = cur.fetchone()
        
        if not user:
            return json_error(404, "No account found with this email.")

        hashed = generate_password_hash(new_password, method="pbkdf2:sha256")
        
        with db.cursor() as cur:
            cur.execute(
                "UPDATE users SET password = %s WHERE id = %s",
                (hashed, user["id"]),
            )
            db.commit()

        return json_resp(200, {
            "message": "Password reset successfully!"
        })
    except Exception:
        logger.exception("reset_password failed email=%s", email)
        return json_error(500, "An error occurred. Please try again.")
    finally:
        db.close()


# ── Profile Edit & Avatar Upload APIs ─────────────────────────────────────────

from flask import current_app
from utils import require_auth
import uuid

ALLOWED_MIME = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MIME_TO_EXT = {
    "image/jpeg": "jpg",
    "image/png":  "png",
    "image/gif":  "gif",
    "image/webp": "webp",
}

def _detect_image_type(header: bytes) -> str | None:
    """Return MIME string if header matches a known image format, else None."""
    if header[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if header[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if header[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    if header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "image/webp"
    return None


@auth_bp.route("/upload", methods=["POST"])
@require_auth
def upload_avatar(identity):
    if "avatar" not in request.files:
        return json_error(400, "No file uploaded.")

    file = request.files["avatar"]

    # 1) Check declared MIME type
    mime = file.mimetype
    if mime not in ALLOWED_MIME:
        return json_error(422, "Only JPEG, PNG, GIF, and WebP images are allowed.")

    # 2) Size check
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > 5 * 1024 * 1024:
        return json_error(422, "File size must be under 5 MB.")

    # 3) Magic-byte check — prevents forged Content-Type attacks
    header = file.read(12)
    file.seek(0)
    actual_mime = _detect_image_type(header)
    if actual_mime is None:
        return json_error(422, "File content does not match a supported image format.")
    if actual_mime != mime:
        logger.warning(
            "MIME mismatch user avatar upload: declared=%s actual=%s user=%s",
            mime, actual_mime, identity.get("user_id"),
        )
        return json_error(422, "Declared content type does not match actual file content.")

    ext = MIME_TO_EXT[actual_mime]
    filename = f"avatar_{uuid.uuid4().hex}.{ext}"
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_dir, exist_ok=True)
    file.save(os.path.join(upload_dir, filename))

    return json_resp(200, {"filename": filename})


@auth_bp.route("/profile", methods=["PUT"])
@require_auth
def update_profile(identity):
    body = request.get_json(silent=True) or {}
    name = body.get("name", "").strip()
    email = body.get("email", "").strip()

    if not name or not email:
        return json_error(422, "Name and email are required.")
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return json_error(422, "Invalid email address format.")

    db = get_db()
    try:
        with db.cursor() as cur:
            # Check if email is already taken by another active user
            cur.execute(
                "SELECT id FROM users WHERE email = %s AND id != %s AND is_active = 1",
                (email, identity["user_id"])
            )
            if cur.fetchone():
                return json_error(409, "Email address is already in use by another account.")

            # Update fields
            if "avatar" in body:
                avatar = body["avatar"]
                if avatar == "":
                    avatar = None
                cur.execute(
                    "UPDATE users SET name = %s, email = %s, avatar = %s WHERE id = %s",
                    (name, email, avatar, identity["user_id"])
                )
            else:
                cur.execute(
                    "UPDATE users SET name = %s, email = %s WHERE id = %s",
                    (name, email, identity["user_id"])
                )
            
            # Fetch updated user object to return
            cur.execute(
                "SELECT id, name, email, slug, role, plan_status, plan_expires_at, avatar "
                "FROM users WHERE id = %s AND is_active = 1",
                (identity["user_id"],),
            )
            user = cur.fetchone()

        if not user:
            return json_error(404, "User not found.")

        # Re-issue access token with updated details
        new_token = create_access_token(
            identity=str(user["id"]),
            additional_claims={
                "slug":        user["slug"],
                "role":        user["role"],
                "plan_status": user["plan_status"],
            }
        )

        return json_resp(200, {
            "token": new_token,
            "user": {
                "id":             user["id"],
                "name":           user["name"],
                "email":          user["email"],
                "slug":           user["slug"],
                "role":           user["role"],
                "plan_status":    user["plan_status"],
                "plan_expires_at": str(user["plan_expires_at"]) if user["plan_expires_at"] else None,
                "avatar":         user["avatar"],
            }
        })
    except Exception:
        logger.exception("update_profile failed user_id=%s", identity["user_id"])
        return json_error(500, "Failed to update profile. Please try again.")
    finally:
        db.close()
