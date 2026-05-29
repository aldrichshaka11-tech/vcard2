import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mail, Phone, Globe, MapPin, AtSign, MessageCircle, Calendar, GitBranch, Link as LinkIcon, Share2, Download, ArrowLeft, Copy, Check, Map, PhoneCall, ExternalLink } from 'lucide-react'
import api from '../api/axios'

const getBrandIcon = (key, size = 20) => {
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

const renderIcon = (key, size = 20) => {
  const brand = getBrandIcon(key, size)
  if (brand) return brand
  switch (key) {
    case 'email': return <Mail size={size} />
    case 'phone': return <Phone size={size} />
    case 'companyUrl': return <Globe size={size} />
    case 'address': return <MapPin size={size} />
    case 'threads': return <AtSign size={size} />
    case 'snapchat': return <AtSign size={size} />
    case 'tiktok': return <AtSign size={size} />
    case 'twitch': return <AtSign size={size} />
    case 'yelp': return <AtSign size={size} />
    case 'whatsapp': return <MessageCircle size={size} />
    case 'signal': return <MessageCircle size={size} />
    case 'discord': return <MessageCircle size={size} />
    case 'skype': return <MessageCircle size={size} />
    case 'telegram': return <MessageCircle size={size} />
    case 'github': return <GitBranch size={size} />
    case 'calendly': return <Calendar size={size} />
    default: return <LinkIcon size={size} />
  }
}

export default function PublicCard() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lead, setLead] = useState({ name: '', email: '', phone: '', note: '' })
  const [sendingLead, setSendingLead] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
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

  useEffect(() => {
    api.get(`/cards/public/${slug}?t=${Date.now()}`)
      .then((res) => {
        const c = res.data.card
        setCard(c)
        api.post('/analytics/view', { card_id: c.id }).catch(() => {})
        // Dynamic title
        const name = c.links?.find(l => l.type === 'meta_name')?.url || c.name || 'Digital Card'
        const company = c.links?.find(l => l.type === 'meta_company')?.url || c.company || ''
        document.title = company ? `${name} | ${company} | Kaira Card` : `${name} | Kaira Card`
      })
      .catch(() => setCard(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center animate-scale-in">
          <p className="text-5xl mb-3">🪪</p>
          <h1 className="text-xl font-bold text-gray-800">Card not available</h1>
          <p className="text-sm text-gray-500 mt-1">This card doesn't exist or is currently inactive.</p>
        </div>
      </div>
    )
  }

  const linkByType = (type) => (Array.isArray(card.links) ? card.links.find((l) => l.type === type)?.url || '' : '')
  const displayName = linkByType('meta_name') || card.name || 'Your Name'
  const displayEmail = linkByType('meta_email') || card.email || ''
  const displayCompany = linkByType('meta_company') || card.company || ''
  const displayTitle = card.title || ''
  const displayBio = card.bio || ''
  const department = linkByType('meta_department')
  const accreditations = linkByType('meta_accreditations')
  const address = linkByType('meta_address')
  const themeColorRaw = linkByType('meta_themeColor') || card.theme || '#6366f1'
  const themeColor = themeColorRaw === 'default' ? '#6366f1' : themeColorRaw

  // Layout values stored as meta links
  const layoutRaw = linkByType('meta_layout')
  const DEFAULT_LAYOUT = { coverHeight: 128, overlap: 48, profileSize: 96, logoSize: 56, cardBgColor: '', cover: { zoom:1,x:50,y:50 }, profile: { zoom:1,x:50,y:50 }, logo: { zoom:1,x:50,y:50 } }
  const layout = layoutRaw ? { ...DEFAULT_LAYOUT, ...JSON.parse(layoutRaw) } : DEFAULT_LAYOUT
  const coverH   = layout.coverHeight
  const overlap  = layout.overlap
  const profSize = layout.profileSize
  const logoSize = layout.logoSize
  const cardBg   = layout.cardBgColor

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

  const vBgEnabled = linkByType('meta_vBg_enabled') === 'true'
  const vBgPreset = linkByType('meta_vBg_preset') || ''
  const vBgCustomFile = linkByType('meta_vBg_custom') || ''
  const vBgFontColor = linkByType('meta_fontColor') || 'dark'

  const uploadsBase = import.meta.env.MODE === 'production'
    ? '/uploads/'
    : 'http://localhost:8000/uploads/'

  const bgStyle = cardBg
    ? { background: cardBg }
    : vBgEnabled
      ? vBgCustomFile
        ? { backgroundImage: `url(${vBgCustomFile.startsWith('http') ? vBgCustomFile : uploadsBase + vBgCustomFile})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: vBgPreset ? `linear-gradient(135deg, ${vBgPreset})` : '#ffffff' }
      : { background: '#ffffff' }

  const fields = [
    displayEmail && { key: 'email', label: 'Email', value: displayEmail, href: `mailto:${displayEmail}` },
    address && { key: 'address', label: 'Address', value: address, href: `https://maps.google.com/?q=${encodeURIComponent(address)}` },
    ...(Array.isArray(card.links) ? card.links.filter((link) => !String(link.type || '').startsWith('meta_')).map((link) => ({
      key: link.type || 'customLink',
      label: link.label || 'Link',
      value: link.url,
      href: link.url.startsWith('http') || link.url.startsWith('mailto') || link.url.startsWith('tel') ? link.url : `https://${link.url}`,
    })) : []),
  ].filter(Boolean)

  const profileFile = linkByType('meta_profile')
  const coverFile = linkByType('meta_cover')
  const logoFile = linkByType('meta_logo')

  const getImageUrl = (filename) => {
    if (!filename) return ''
    if (filename.startsWith('http')) return filename
    const cleanFile = filename.includes('uploads/') ? filename.split('uploads/').pop() : filename
    const finalFile = cleanFile.startsWith('/') ? cleanFile.substring(1) : cleanFile
    return `${uploadsBase}${finalFile}`
  }

  const profilePhotoUrl = getImageUrl(profileFile || card.photo)
  const coverPhotoUrl = getImageUrl(coverFile)
  const logoUrl = getImageUrl(logoFile)

  const saveVCF = () => {
    const phone = Array.isArray(card.links) ? card.links.find((l) => l.type === 'phone')?.url || '' : ''
    const website = Array.isArray(card.links) ? card.links.find((l) => l.type === 'website')?.url || '' : ''

    const lines = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `FN:${displayName || 'Contact'}`,
      `N:${displayName || 'Contact'};;;;`,
      displayCompany ? `ORG:${displayCompany}` : '',
      card.title     ? `TITLE:${card.title}`   : '',
      phone          ? `TEL;TYPE=CELL:${phone}` : '',
      displayEmail   ? `EMAIL;TYPE=INTERNET:${displayEmail}` : '',
      website        ? `URL:${website}` : '',
      'END:VCARD',
    ].filter(Boolean)

    const vcfContent = lines.join('\r\n') + '\r\n'
    const blob = new Blob([vcfContent], { type: 'text/x-vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(displayName || 'contact').replace(/\s+/g, '-').toLowerCase()}.vcf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareCard = async () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: displayName || 'Digital Card', text: card.bio || 'Connect with me', url }).catch(() => {})
      return
    }
    navigator.clipboard.writeText(url).catch(() => {})
    alert('Link copied to clipboard!')
  }

  const submitLead = async (e) => {
    e.preventDefault()
    setSendingLead(true)
    try {
      await api.post('/leads', {
        slug: slug || String(card.id),
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        note: lead.note,
      })
      alert('Thanks! Your details were shared successfully.')
      setLead({ name: '', email: '', phone: '', note: '' })
      setShowLeadForm(false)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit your details.')
    } finally {
      setSendingLead(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-start px-4 py-6 md:py-12 relative">
      {/* Non-overlapping Back Button aligned with card container */}
      <div className="w-full max-w-md mb-4 flex justify-start">
        <button 
          onClick={() => {
            if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
              navigate(-1)
            } else {
              navigate(localStorage.getItem('token') ? '/dashboard' : '/')
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/80 shadow-md transition-all hover:scale-105 active:scale-95 font-bold text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Premium custom glow container */}
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl transition-all duration-300 animate-scale-in" 
        style={{ 
          ...bgStyle,
          boxShadow: `0 20px 40px -15px ${themeColor}25, 0 8px 30px -10px ${themeColor}15`,
          border: `1px solid ${themeColor}15`
        }}>
        {/* Cover */}
        <div className="relative overflow-hidden" style={{ height: `${coverH}px`, clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0% 100%)', borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem' }}>
          {coverPhotoUrl ? (
            <img src={coverPhotoUrl} alt="cover"
              style={{ ...imgStyle('cover'), position: 'absolute', inset: 0 }} />
          ) : (
            <div className="w-full h-full"
              style={{ background: vBgEnabled ? 'transparent' : `linear-gradient(135deg, ${themeColor}cc, ${themeColor}55)` }} />
          )}
        </div>

        {/* Header body - centered layout */}
        <div className="px-6 pb-6 flex flex-col items-center text-center relative">
          {/* Profile photo */}
          <div className="flex flex-col items-center flex-shrink-0" style={{ marginTop: `-${overlap}px`, zIndex: 20 }}>
            <div className="rounded-full border-[4px] border-white shadow-md overflow-hidden"
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
            
            {/* Accreditations / Badges */}
            {accreditations && (
              <div className="flex flex-col gap-1.5 mt-3 w-full items-center">
                {accreditations.split(',').map((a, i) => (
                  <span key={i} className="text-[10px] font-bold px-3 py-0.5 rounded-full text-center shadow-sm w-fit border border-slate-100" 
                    style={{ background: `${themeColor}15`, color: themeColor }}>
                    {a.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Name, Title, Department */}
          <div className="mt-4 space-y-1 z-10 w-full">
            <h1 className="text-3xl font-bold text-slate-800 leading-tight break-words">{displayName}</h1>
            {displayTitle && <p className="text-[17px] font-medium text-slate-500 leading-tight">{displayTitle}</p>}
            {displayCompany && <p className="text-[17px] font-medium italic text-slate-800">{displayCompany}</p>}
            {department && <p className="text-[15px] font-medium text-slate-400">{department}</p>}
          </div>

          {/* Logo container */}
          {logoUrl && (
            <div className="absolute z-20" style={{ right: '24px', top: `${(coverH * 0.85) - (logoSize / 2)}px` }}>
              <div className="rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden p-1.5 flex items-center justify-center"
                style={{ width: `${logoSize}px`, height: `${logoSize}px` }}>
                <img src={logoUrl} alt="logo" style={imgStyle('logo')} className="rounded-xl" />
              </div>
            </div>
          )}
        </div>

        {/* Elegant Bio Quote Section */}
        {displayBio && (
          <div className="px-8 py-3">
            <div className="flex gap-4 items-start bg-slate-50/50 rounded-3xl p-4 border border-slate-100/60 shadow-sm">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${themeColor}15`, color: themeColor }}>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.154c-2.433.914-3.996 3.635-3.996 5.846h3.999v10h-9.999z" />
                </svg>
              </div>
              <p className="text-[15px] italic text-slate-600 leading-relaxed flex-1 mt-1">{displayBio}</p>
            </div>
          </div>
        )}

        {/* Contact Fields & Buttons Area */}
        <div className="px-8 pb-8 pt-4">
          {/* Fields list */}
          {fields.length > 0 && (
            <div className="space-y-5">
              {fields.map((f) => {
                const isCopyable = ['email', 'phone', 'address'].includes(f.key)

                const handleRowClick = (e) => {
                  if (isCopyable) {
                    e.preventDefault()
                    copyToClipboard(f.value, f.key)
                  }
                }
                
                const displayValue = f.key === 'address' 
                  ? f.value.split(',').map((part, idx) => <span key={idx}>{part.trim()}{idx < f.value.split(',').length - 1 ? ',' : ''}<br/></span>)
                  : f.value

                return (
                  <a
                    key={f.key}
                    href={f.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleRowClick}
                    className="flex items-center gap-5 group cursor-pointer"
                  >
                    {/* Left Solid Icon Container */}
                    <div className="rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-md transition-transform group-hover:scale-105"
                      style={{ background: themeColor, width: '48px', height: '48px' }}>
                      {renderIcon(f.key, 20)}
                    </div>
                    
                    {/* Details (No labels, just value) */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[16px] font-medium text-slate-800 leading-snug">{displayValue}</p>
                      {copiedField === f.key && (
                        <p className="text-[12px] text-green-600 font-bold mt-1">Copied!</p>
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          )}

          {/* Action Buttons Section */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              {/* Share Button */}
              <button 
                onClick={shareCard} 
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer" 
                style={{ background: themeColor }}
              >
                <Share2 size={16} />
                Share
              </button>
              
              {/* Save Contact Button */}
              <button 
                onClick={saveVCF} 
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border-2 transition-all hover:scale-[1.02] active:scale-[0.98] bg-white cursor-pointer" 
                style={{ borderColor: themeColor, color: themeColor }}
              >
                <Download size={16} />
                Save Contact
              </button>
            </div>

            {/* Share Details Button */}
            {!showLeadForm && (
              <button 
                onClick={() => setShowLeadForm(true)}
                className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all text-center cursor-pointer" 
                style={{ borderColor: themeColor, color: themeColor }}
              >
                Share Your Details
              </button>
            )}

            {/* Lead Form */}
            {showLeadForm && (
              <form onSubmit={submitLead} className="mt-5 border border-gray-100 rounded-2xl p-3 space-y-2 bg-white/80 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Share your details</p>
                  <button type="button" onClick={() => setShowLeadForm(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕ Close</button>
                </div>
                <input required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400" placeholder="Your name" value={lead.name} onChange={(e) => setLead((p) => ({ ...p, name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <input required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400" placeholder="Email" type="email" value={lead.email} onChange={(e) => setLead((p) => ({ ...p, email: e.target.value }))} />
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400" placeholder="Phone" value={lead.phone} onChange={(e) => setLead((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <textarea required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none" rows={2} placeholder="Context or note" value={lead.note} onChange={(e) => setLead((p) => ({ ...p, note: e.target.value }))} />
                <button type="submit" disabled={sendingLead} className="w-full text-sm font-bold border-2 py-2.5 rounded-xl transition-all cursor-pointer" style={{ borderColor: themeColor, color: themeColor }}>
                  {sendingLead ? 'Submitting...' : 'Submit Details'}
                </button>
              </form>
            )}

            {/* Safe zone spacer for Virtual Background bottom graphics */}
            {vBgEnabled && (
              <div className="h-28 w-full pointer-events-none" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
