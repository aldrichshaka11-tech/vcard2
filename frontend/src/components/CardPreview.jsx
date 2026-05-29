import { useState } from 'react'
import { Mail, Phone, Globe, MapPin, AtSign, MessageCircle, Calendar, GitBranch, Link as LinkIcon, Pencil, Settings, Palette, Share2, Download, Copy, Check, Map, PhoneCall, ExternalLink } from 'lucide-react'
import ImageAdjustModal from '../editor/ImageAdjustModal'

const getBrandIcon = (key, size = 16) => {
  const props = { width: size, height: size, stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (key) {
    case 'twitter':
      return <svg {...props} viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
    case 'instagram':
      return <svg {...props} viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
    case 'linkedin':
      return <svg {...props} viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
    case 'facebook':
      return <svg {...props} viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
    case 'youtube':
      return <svg {...props} viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
    case 'github':
      return <svg {...props} viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
    default:
      return null
  }
}

const ICON_MAP = {
  email: <Mail size={16} />, phone: <Phone size={16} />, companyUrl: <Globe size={16} />,
  address: <MapPin size={16} />, twitter: getBrandIcon('twitter', 16), instagram: getBrandIcon('instagram', 16),
  threads: <AtSign size={16} />, linkedin: getBrandIcon('linkedin', 16), facebook: getBrandIcon('facebook', 16),
  youtube: getBrandIcon('youtube', 16), snapchat: <AtSign size={16} />, tiktok: <AtSign size={16} />,
  twitch: <AtSign size={16} />, yelp: <AtSign size={16} />, whatsapp: <MessageCircle size={16} />,
  signal: <MessageCircle size={16} />, discord: <MessageCircle size={16} />,
  skype: <MessageCircle size={16} />, telegram: <MessageCircle size={16} />,
  github: getBrandIcon('github', 16), calendly: <Calendar size={16} />, customLink: <LinkIcon size={16} />,
}

const DEFAULT_LAYOUT = {
  coverHeight: 128, overlap: 48, profileSize: 96, logoSize: 56, cardBgColor: '',
  cover:   { zoom: 1, x: 50, y: 50 },
  profile: { zoom: 1, x: 50, y: 50 },
  logo:    { zoom: 1, x: 50, y: 50 },
}

export default function CardPreview({ card = {}, editable = false, onLayoutChange }) {
  const [modal, setModal] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(key)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const uploadsBase = import.meta.env.MODE === 'production'
    ? '/uploads/'
    : 'http://localhost:8000/uploads/'

  const links = card.links || []
  const metaByType = (type) => links.find(l => l.type === type)?.url || ''

  const themeColorRaw = metaByType('meta_themeColor') || card.theme || '#6366f1'
  const themeColor = themeColorRaw === 'default' ? '#6366f1' : themeColorRaw
  const vBgEnabled = metaByType('meta_vBg_enabled') === 'true'
  const vBgPreset  = metaByType('meta_vBg_preset') || ''
  const vBgCustomFile = metaByType('meta_vBg_custom') || ''

  const layout = { ...DEFAULT_LAYOUT, ...(card.layout || {}) }
  const coverH   = layout.coverHeight
  const overlap  = layout.overlap
  const profSize = layout.profileSize
  const logoSize = layout.logoSize
  const cardBg   = layout.cardBgColor

  const bgStyle = cardBg
    ? { background: cardBg }
    : vBgEnabled
      ? vBgCustomFile
        ? { backgroundImage: `url(${vBgCustomFile.startsWith('http') ? vBgCustomFile : uploadsBase + vBgCustomFile})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : vBgPreset ? { background: vBgPreset } : { background: '#ffffff' }
      : { background: '#ffffff' }

  const getImageUrl = (filename) => {
    if (!filename) return ''
    if (filename.startsWith('http')) return filename
    return `${uploadsBase}${filename}`
  }

  const profilePhotoUrl = getImageUrl(metaByType('meta_profile') || card.photo)
  const coverPhotoUrl   = getImageUrl(metaByType('meta_cover'))
  const logoUrl         = getImageUrl(metaByType('meta_logo'))

  const displayName    = metaByType('meta_name')    || card.name    || 'Your Name'
  const displayEmail   = metaByType('meta_email')   || card.email   || ''
  const displayCompany = metaByType('meta_company') || card.company || ''
  const displayTitle   = card.title || ''
  const displayBio     = card.bio || ''
  const department     = metaByType('meta_department')
  const accreditations = metaByType('meta_accreditations')
  const address        = metaByType('meta_address')
  const ctaLabel       = metaByType('meta_ctaLabel')

  const fields = [
    displayEmail && { key: 'email', label: 'Email', value: displayEmail, href: `mailto:${displayEmail}` },
    address && { key: 'address', label: 'Address', value: address, href: `https://maps.google.com/?q=${encodeURIComponent(address)}` },
    ...links.filter(l => !String(l.type || '').startsWith('meta_')).map(l => ({
      key: l.type || 'customLink',
      label: l.label || l.type || 'Link',
      value: l.url,
      href: l.url.startsWith('http') || l.url.startsWith('mailto') || l.url.startsWith('tel') ? l.url : `https://${l.url}`,
    })),
  ].filter(Boolean)

  const imgStyle = (imgKey) => {
    const v = layout[imgKey] || { zoom: 1, x: 50, y: 50 }
    return {
      objectFit: 'cover',
      objectPosition: `${v.x}% ${v.y}%`,
      transform: `scale(${v.zoom})`,
      transformOrigin: `${v.x}% ${v.y}%`,
      width: '100%',
      height: '100%',
    }
  }

  const EditBtn = ({ onClick, className = '' }) => (
    <button onClick={onClick}
      className={`absolute flex items-center justify-center w-6 h-6 bg-black/60 hover:bg-indigo-600 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer ${className}`}>
      <Pencil size={10} />
    </button>
  )

  const handleSave = (newLayout) => {
    if (onLayoutChange) onLayoutChange(newLayout)
  }

  return (
    <>
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white rounded-3xl overflow-visible transition-all duration-300 border border-gray-200" 
          style={{ 
            ...bgStyle,
            boxShadow: `0 20px 40px -15px ${themeColor}25, 0 8px 30px -10px ${themeColor}15`,
            border: `1px solid ${themeColor}15`
          }}>

          {/* Cover photo */}
          <div className="relative group rounded-t-3xl overflow-hidden" style={{ height: `${coverH}px` }}>
            {coverPhotoUrl ? (
              <div className="w-full h-full overflow-hidden">
                <img src={coverPhotoUrl} alt="cover"
                  style={{ ...imgStyle('cover'), position: 'absolute', inset: 0 }} />
              </div>
            ) : (
              <div className="w-full h-full rounded-t-3xl"
                style={{ background: `linear-gradient(135deg, ${themeColor}cc, ${themeColor}55)` }} />
            )}
            {editable && coverPhotoUrl && (
              <EditBtn onClick={() => setModal('cover')} className="top-2 right-2" />
            )}
          </div>

          {/* Header body - side-by-side flex layout */}
          <div className="px-5 pt-2 pb-3 flex gap-3 relative">
            {/* Left side: Profile photo and Accreditations */}
            <div className="flex flex-col items-center flex-shrink-0" style={{ marginTop: `-${overlap}px`, zIndex: 20 }}>
              <div className="rounded-full border-4 border-white shadow-xl overflow-hidden relative group"
                style={{ width: `${profSize}px`, height: `${profSize}px` }}>
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt={displayName} style={imgStyle('profile')} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-white"
                    style={{ background: themeColor, fontSize: `${profSize * 0.33}px` }}>
                    {displayName?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              {editable && profilePhotoUrl && (
                <button onClick={() => setModal('profile')}
                  className="absolute bottom-6 right-0 w-6 h-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-30 cursor-pointer">
                  <Pencil size={10} />
                </button>
              )}
              
              {/* Accreditations / Badges under profile photo */}
              {accreditations && (
                <div className="flex flex-col gap-1 mt-2.5 w-full items-center">
                  {accreditations.split(',').map((a, i) => (
                    <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded-full text-center shadow-sm w-fit border border-slate-100" 
                      style={{ background: `${themeColor}15`, color: themeColor }}>
                      {a.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Name, Title, Department, Location */}
            <div className="flex-1 pt-1.5 space-y-0.5 min-w-0 z-10">
              <h1 className="text-xl font-bold text-slate-800 truncate">{displayName}</h1>
              {displayTitle && <p className="text-xs font-semibold text-slate-500 leading-tight">{displayTitle}</p>}
              {department && <p className="text-[10px] font-semibold text-slate-400">{department}</p>}
              {address && (
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold pt-0.5">
                  <MapPin size={11} style={{ color: themeColor }} />
                  <span className="truncate">{address.split(',')[address.split(',').length - 1]?.trim() || address}</span>
                </div>
              )}
            </div>

            {/* Logo container overlapping top right */}
            {logoUrl && (
              <div className="absolute z-20" style={{ right: '20px', top: `-${Math.round(logoSize / 2)}px` }}>
                <div className="rounded-xl bg-white shadow-lg border border-slate-100 overflow-hidden p-1 flex items-center justify-center"
                  style={{ width: `${logoSize}px`, height: `${logoSize}px` }}>
                  <img src={logoUrl} alt="logo" style={imgStyle('logo')} className="rounded-lg" />
                </div>
                {editable && (
                  <button onClick={() => setModal('logo')}
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-30 cursor-pointer">
                    <Pencil size={8} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Edit toolbar — only in editor */}
          {editable && (
            <div className="flex gap-2 px-5 py-1">
              <button onClick={() => setModal('layout')}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-gray-600 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors border border-gray-200 cursor-pointer">
                <Settings size={10} /> Layout
              </button>
              <button onClick={() => setModal('bg')}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-gray-600 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors border border-gray-200 cursor-pointer">
                <Palette size={10} /> Background
              </button>
            </div>
          )}

          {/* Elegant Bio Quote Section */}
          {displayBio && (
            <div className="px-5 py-1">
              <div className="border-t border-slate-100 my-1" />
              <div className="flex gap-2.5 items-center bg-slate-50/50 rounded-xl p-2.5 border border-slate-100/60">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${themeColor}15`, color: themeColor }}>
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.154c-2.433.914-3.996 3.635-3.996 5.846h3.999v10h-9.999z" />
                  </svg>
                </div>
                <p className="text-xs italic text-slate-600 leading-relaxed flex-1">{displayBio}</p>
              </div>
            </div>
          )}

          {/* Contact Fields & Buttons Area */}
          <div className="px-5 pb-5 space-y-3.5 pt-1">
            {/* Fields list */}
            {fields.length > 0 && (
              <div className="space-y-1.5">
                {fields.slice(0, 4).map((f) => {
                  const isCopyable = ['email', 'phone', 'address'].includes(f.key)
                  const actionIcon = (() => {
                    if (copiedField === f.key) {
                      return <Check size={13} className="text-green-600" />
                    }
                    if (f.key === 'email') return <Copy size={13} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    if (f.key === 'address') return <Map size={13} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    if (f.key === 'phone') return <PhoneCall size={13} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    return <ExternalLink size={13} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  })()

                  const handleRowClick = (e) => {
                    if (isCopyable && f.key !== 'address') {
                      e.preventDefault()
                      copyToClipboard(f.value, f.key)
                    }
                  }

                  return (
                    <a
                      key={f.key}
                      href={f.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={handleRowClick}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-100 hover:border-slate-200 transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer shadow-sm"
                      style={{ background: '#f8fafc' }}
                    >
                      {/* Left Solid Icon Box */}
                      <div className="w-8.5 h-8.5 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-sm transition-transform group-hover:scale-105"
                        style={{ background: themeColor, width: '34px', height: '34px' }}>
                        {ICON_MAP[f.key] || <LinkIcon size={14} />}
                      </div>
                      
                      {/* Middle Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">{f.label}</p>
                        <p className="text-xs font-semibold text-slate-700 truncate leading-tight">{f.value}</p>
                      </div>

                      {/* Right Action Icon */}
                      <div className="w-7 h-7 rounded-md flex items-center justify-center bg-slate-100/50 group-hover:bg-slate-100 transition-colors flex-shrink-0"
                        style={{ color: themeColor }}>
                        {actionIcon}
                      </div>
                    </a>
                  )
                })}
              </div>
            )}

            {/* Action Buttons Section */}
            <div className="flex gap-2.5 pt-1">
              {/* Share Button */}
              <button 
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer" 
                style={{ background: themeColor }}
              >
                <Share2 size={13} />
                Share
              </button>
              
              {/* Save Contact Button */}
              <button 
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all hover:scale-[1.02] active:scale-[0.98] bg-white cursor-pointer" 
                style={{ borderColor: themeColor, color: themeColor }}
              >
                <Download size={13} />
                {ctaLabel || 'Save Contact'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <ImageAdjustModal
          type={modal}
          label={modal === 'cover' ? 'Cover Photo' : modal === 'profile' ? 'Profile Photo' : 'Company Logo'}
          layout={layout}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
