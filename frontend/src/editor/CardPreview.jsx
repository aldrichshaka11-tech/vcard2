import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Mail, Phone, Globe, MapPin, AtSign, MessageCircle, Calendar, GitBranch, Link as LinkIcon, Pencil, Settings, Palette, Share2, Download, Copy, Check, Map, PhoneCall, ExternalLink } from 'lucide-react'
import ImageAdjustModal from './ImageAdjustModal'

const getBrandIcon = (key, size = 15) => {
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
  email: <Mail size={15} />, phone: <Phone size={15} />, companyUrl: <Globe size={15} />,
  address: <MapPin size={15} />, twitter: getBrandIcon('twitter', 15), instagram: getBrandIcon('instagram', 15),
  threads: <AtSign size={15} />, linkedin: getBrandIcon('linkedin', 15), facebook: getBrandIcon('facebook', 15),
  youtube: getBrandIcon('youtube', 15), snapchat: <AtSign size={15} />, tiktok: <AtSign size={15} />,
  twitch: <AtSign size={15} />, yelp: <AtSign size={15} />, whatsapp: <MessageCircle size={15} />,
  signal: <MessageCircle size={15} />, discord: <MessageCircle size={15} />,
  skype: <MessageCircle size={15} />, telegram: <MessageCircle size={15} />,
  github: getBrandIcon('github', 15), calendly: <Calendar size={15} />, customLink: <LinkIcon size={15} />,
}

const DEFAULT_LAYOUT = {
  coverHeight: 128, overlap: 48, profileSize: 96, logoSize: 56, cardBgColor: '',
  cardRadius: 36, bodyPadding: 16, fontSize: 14, textAlign: 'center',
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

  const themeRaw = card.themeColor || '#6366f1'
  const theme = themeRaw === 'default' ? '#6366f1' : themeRaw
  const layout = { ...DEFAULT_LAYOUT, ...(card.layout || {}) }
  const coverH   = layout.coverHeight
  const overlap  = layout.overlap
  const profSize = layout.profileSize
  const logoSize = layout.logoSize
  const cardBg   = layout.cardBgColor

  const uploadsBase = import.meta.env.MODE === 'production'
    ? '/uploads/'
    : 'http://localhost:8000/uploads/'

  const bgStyle = (() => {
    if (card.virtualBg?.enabled) {
      if (card.virtualBg.custom) {
        const customBg = card.virtualBg.custom
        const isFullUrl = customBg.startsWith('http') || customBg.startsWith('data:') || customBg.startsWith('blob:')
        const cleanBg = !isFullUrl && customBg.includes('uploads/') ? customBg.split('uploads/').pop() : customBg
        const finalBg = !isFullUrl && cleanBg.startsWith('/') ? cleanBg.substring(1) : cleanBg
        const bgUrl = isFullUrl ? customBg : `${uploadsBase}${finalBg}`
        return {
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundAttachment: 'local',
        }
      }
      if (card.virtualBg.preset) {
        return { background: card.virtualBg.preset }
      }
    }
    if (cardBg) return { background: cardBg }
    return { background: '#ffffff' }
  })()

  const imgStyle = (imgKey) => {
    const v = layout[imgKey] || { zoom: 1, x: 50, y: 50 }
    return {
      width: '100%', height: '100%', objectFit: 'cover',
      objectPosition: `${v.x}% ${v.y}%`,
      transform: `scale(${v.zoom})`,
      transformOrigin: `${v.x}% ${v.y}%`,
    }
  }

  const fields = [
    card.email      && { key: 'email',      label: 'Email',   value: card.email },
    card.phone      && { key: 'phone',      label: 'Phone',   value: card.phone },
    card.companyUrl && { key: 'companyUrl', label: 'Website', value: card.companyUrl },
    card.customLink && { key: 'customLink', label: card.customLinkLabel || 'Link', value: card.customLink },
    card.address    && { key: 'address',    label: 'Address', value: card.address },
    card.twitter    && { key: 'twitter',    label: 'X',       value: card.twitter },
    card.instagram  && { key: 'instagram',  label: 'Instagram', value: card.instagram },
    card.threads    && { key: 'threads',    label: 'Threads', value: card.threads },
    card.linkedin   && { key: 'linkedin',   label: 'LinkedIn', value: card.linkedin },
    card.facebook   && { key: 'facebook',   label: 'Facebook', value: card.facebook },
    card.youtube    && { key: 'youtube',    label: 'YouTube', value: card.youtube },
    card.snapchat   && { key: 'snapchat',   label: 'Snapchat', value: card.snapchat },
    card.tiktok     && { key: 'tiktok',     label: 'TikTok',  value: card.tiktok },
    card.twitch     && { key: 'twitch',     label: 'Twitch',  value: card.twitch },
    card.yelp       && { key: 'yelp',       label: 'Yelp',    value: card.yelp },
    card.whatsapp   && { key: 'whatsapp',   label: 'WhatsApp', value: card.whatsapp },
    card.signal     && { key: 'signal',     label: 'Signal',  value: card.signal },
    card.discord    && { key: 'discord',    label: 'Discord', value: card.discord },
    card.skype      && { key: 'skype',      label: 'Skype',   value: card.skype },
    card.telegram   && { key: 'telegram',   label: 'Telegram', value: card.telegram },
    card.github     && { key: 'github',     label: 'GitHub',  value: card.github },
    card.calendly   && { key: 'calendly',   label: 'Calendly', value: card.calendly },
  ].filter(Boolean)

  Object.values(card.customFields || {}).flat().forEach(cf => {
    if (cf.value) fields.push({ key: cf.id, label: cf.label, value: cf.value })
  })

  const tags = (card.leadTags || '').split(',').map(t => t.trim()).filter(Boolean)

  const isLightText = card.virtualBg?.enabled && card.virtualBg?.fontColor === 'light'
  const tc = {
    primary:   isLightText ? 'text-white' : 'text-gray-900',
    secondary: isLightText ? 'text-white/80' : 'text-gray-600',
    tertiary:  isLightText ? 'text-white/60' : 'text-gray-400',
    company:   isLightText ? 'text-white/90' : 'text-gray-700',
    fieldVal:  isLightText ? 'text-white/90' : 'text-gray-700',
    fieldLabel:isLightText ? 'text-white/60' : 'text-gray-400',
  }

  return (
    <>
      {/* ── Phone frame ── */}
      <div className="relative mx-auto select-none" style={{ width: 340 }}>

        {/* Phone shell */}
        <div className="relative rounded-[2.8rem] bg-gray-900 shadow-2xl"
          style={{ padding: '12px 10px 16px', boxShadow: '0 30px 60px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)' }}>

          {/* Side buttons */}
          <div className="absolute left-[-3px] top-24 w-1 h-8 bg-gray-700 rounded-l-sm" />
          <div className="absolute left-[-3px] top-36 w-1 h-12 bg-gray-700 rounded-l-sm" />
          <div className="absolute left-[-3px] top-52 w-1 h-12 bg-gray-700 rounded-l-sm" />
          <div className="absolute right-[-3px] top-32 w-1 h-16 bg-gray-700 rounded-r-sm" />

          {/* Screen bezel */}
          <div className="overflow-hidden bg-white" style={{ height: 620, borderRadius: `${layout.cardRadius ?? 36}px` }}>

            {/* Notch */}
            <div className="relative flex justify-center pt-2 pb-1 bg-gray-900">
              <div className="w-24 h-5 bg-gray-900 rounded-b-2xl flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                <div className="w-8 h-1.5 rounded-full bg-gray-800" />
              </div>
            </div>

            {/* Scrollable card content */}
            <div className="overflow-y-auto" style={{ height: 588 }}>
              {/* bgStyle wraps entire card */}
                <div 
                  className="transition-all duration-300 cursor-context-menu" 
                  style={{ ...bgStyle, minHeight: '100%' }}
                  onContextMenu={(e) => {
                    if (editable) {
                      e.preventDefault()
                      setModal('layout')
                    }
                  }}
                >

                {/* Cover */}
                  <div 
                    className="relative group overflow-hidden cursor-context-menu" 
                    style={{ height: `${coverH}px`, clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0% 100%)' }}
                    onContextMenu={(e) => {
                      if (editable) {
                        e.preventDefault()
                        setModal('cover')
                      }
                    }}
                  >
                  {card.coverPhoto ? (
                    <img src={card.coverPhoto} alt="cover"
                      style={{ ...imgStyle('cover'), position: 'absolute', inset: 0 }} />
                  ) : (
                    <div className="w-full h-full"
                      style={{ background: card.virtualBg?.enabled ? 'transparent' : `linear-gradient(135deg, ${theme}cc, ${theme}55)` }} />
                  )}
                  {editable && card.coverPhoto && (
                    <button onClick={() => setModal('cover')}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 cursor-pointer">
                      <Pencil size={10} />
                    </button>
                  )}
                </div>

                {/* Header body - centered layout */}
                <div 
                  className={`pb-4 flex flex-col relative ${
                    layout.textAlign === 'left' ? 'items-start text-left' : layout.textAlign === 'right' ? 'items-end text-right' : 'items-center text-center'
                  }`}
                  style={{ 
                    paddingLeft: `${layout.bodyPadding ?? 16}px`, 
                    paddingRight: `${layout.bodyPadding ?? 16}px`, 
                    paddingBottom: `${layout.bodyPadding ?? 16}px` 
                  }}
                >
                  {/* Profile photo */}
                  <div className="flex flex-col items-center flex-shrink-0" style={{ marginTop: `-${overlap}px`, zIndex: 20 }}>
                    <div 
                      className="rounded-full border-[4px] border-white shadow-md overflow-hidden relative group cursor-context-menu"
                      style={{ width: `${profSize}px`, height: `${profSize}px` }}
                      onContextMenu={(e) => {
                        if (editable) {
                          e.preventDefault()
                          setModal('profile')
                        }
                      }}
                    >
                      {card.profilePhoto ? (
                        <img src={card.profilePhoto} alt={card.name} style={imgStyle('profile')} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-white"
                          style={{ background: theme, fontSize: `${profSize * 0.33}px` }}>
                          {card.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    {editable && card.profilePhoto && (
                      <button onClick={() => setModal('profile')}
                        className="absolute bottom-1 right-0 w-6 h-6 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-30 cursor-pointer"
                        style={{ background: theme }}>
                        <Pencil size={10} />
                      </button>
                    )}
                    
                    {/* Accreditations / Badges */}
                    {card.accreditations && (
                      <div className="flex flex-col gap-1 mt-2 w-full items-center">
                        {card.accreditations.split(',').map((a, i) => (
                          <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded-full text-center shadow-sm w-fit border border-slate-100" 
                            style={{ background: `${theme}15`, color: theme }}>
                            {a.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Name, Title, Department */}
                  <div className="mt-3 space-y-1 z-10 w-full">
                    <h1 className={`font-bold leading-tight ${tc.primary}`}
                      style={{ fontSize: `${((layout.fontSize ?? 14) * 1.57).toFixed(1)}px` }}>{card.name || 'Your Name'}</h1>
                    {card.jobTitle && <p className="font-medium text-slate-500"
                      style={{ fontSize: `${((layout.fontSize ?? 14) * 0.93).toFixed(1)}px` }}>{card.jobTitle}</p>}
                    {card.companyName && <p className={`font-medium italic ${tc.primary}`}
                      style={{ fontSize: `${((layout.fontSize ?? 14) * 0.93).toFixed(1)}px` }}>{card.companyName}</p>}
                    {card.department && <p className="font-medium text-slate-400"
                      style={{ fontSize: `${((layout.fontSize ?? 14) * 0.79).toFixed(1)}px` }}>{card.department}</p>}
                  </div>

                  {/* Logo container (Top Right relative to card, not center) */}
                  {card.companyLogo && (
                    <div className="absolute z-20" style={{ right: '16px', top: `${(coverH * 0.85) - (logoSize / 2)}px` }}>
                      <div 
                        className="rounded-xl bg-white shadow-md border border-slate-100 overflow-hidden p-1 flex items-center justify-center relative group cursor-context-menu"
                        style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                        onContextMenu={(e) => {
                          if (editable) {
                            e.preventDefault()
                            setModal('logo')
                          }
                        }}
                      >
                        <img src={card.companyLogo} alt="logo" style={imgStyle('logo')} className="rounded-lg" />
                        {editable && (
                          <button onClick={() => setModal('logo')}
                            className="absolute -bottom-1 -right-1 w-4 h-4 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-30 cursor-pointer"
                            style={{ background: theme }}>
                            <Pencil size={7} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit toolbar */}
                {editable && (
                  <div className="flex justify-center gap-2 px-4 pb-2">
                    <button onClick={() => setModal('layout')}
                      className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 cursor-pointer shadow-sm">
                      <Settings size={10} /> Layout
                    </button>
                    <button onClick={() => setModal('bg')}
                      className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 cursor-pointer shadow-sm">
                      <Palette size={10} /> BG
                    </button>
                  </div>
                )}

                {/* Elegant Bio Quote Section */}
                {card.headline && (
                  <div className="px-6 py-2">
                    <div className="flex gap-3 items-start bg-slate-50/50 rounded-2xl p-3 border border-slate-100/60 shadow-sm">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${theme}15`, color: theme }}>
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.154c-2.433.914-3.996 3.635-3.996 5.846h3.999v10h-9.999z" />
                        </svg>
                      </div>
                      <p className="text-[11px] italic text-slate-600 leading-relaxed flex-1 mt-0.5">{card.headline}</p>
                    </div>
                  </div>
                )}

                {/* Lead context panel */}
                {(card.leadSource || tags.length > 0 || card.followUpDate) && (
                  <div className="mx-6 mt-2 mb-2 rounded-xl border border-gray-100 p-3 space-y-1 bg-white shadow-sm">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Lead Context</p>
                    {card.leadSource   && <p className="text-[10px] text-gray-700 font-medium">Source: {card.leadSource}</p>}
                    {card.followUpDate && <p className="text-[10px] text-gray-700 font-medium">Follow-up: {card.followUpDate}</p>}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tags.map(tag => (
                          <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Fields — minimalist rows */}
                <div className="px-6 pb-6 pt-2">
                  {fields.length > 0 && (
                    <div className="space-y-4">
                      {fields.map((f, i) => {
                        const isCopyable = ['email', 'phone', 'address'].includes(f.key)

                        const handleRowClick = (e) => {
                          if (isCopyable) {
                            e.preventDefault()
                            copyToClipboard(f.value, f.key)
                          }
                        }

                        // Split address into multiple lines if needed
                        const displayValue = f.key === 'address' 
                          ? f.value.split(',').map((part, idx) => <span key={idx}>{part.trim()}{idx < f.value.split(',').length - 1 ? ',' : ''}<br/></span>)
                          : f.value

                        return (
                          <div
                            key={i}
                            onClick={handleRowClick}
                            className="flex items-center gap-4 group cursor-pointer"
                          >
                            {/* Left Solid Icon Box */}
                            <div className="rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm transition-transform group-hover:scale-105"
                              style={{ background: theme, width: '38px', height: '38px' }}>
                              {ICON_MAP[f.key] || <LinkIcon size={16} />}
                            </div>
                            
                            {/* Details (No labels, just value) */}
                            <div className="flex-1 min-w-0 text-left">
                              <p className={`font-medium leading-snug ${tc.primary}`}
                                style={{ fontSize: `${((layout.fontSize ?? 14) * 0.86).toFixed(1)}px` }}>{displayValue}</p>
                              {copiedField === f.key && (
                                <p className="text-[9px] text-green-600 font-bold mt-0.5">Copied!</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Safe zone spacer for Virtual Background bottom graphics */}
                  {card.virtualBg?.enabled && (
                    <div className="h-28 w-full pointer-events-none" />
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center mt-2">
          <div className="w-20 h-1 bg-gray-600 rounded-full" />
        </div>
      </div>

      {modal && createPortal(
        <ImageAdjustModal
          type={modal}
          layout={layout}
          onChange={(newLayout) => { if (onLayoutChange) onLayoutChange(newLayout) }}
          onSave={(newLayout) => { if (onLayoutChange) onLayoutChange(newLayout) }}
          onClose={() => setModal(null)}
        />,
        document.body
      )}
    </>
  )
}
