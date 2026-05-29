import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Globe, AtSign, MessageCircle, Briefcase, Share2, RotateCcw, Eye, Save, Sparkles, Target, Check, ChevronLeft, ChevronRight, X, Trash2, Menu, LayoutDashboard, CreditCard, Pencil } from 'lucide-react'
import html2canvas from 'html2canvas'
import { useCardStore } from './useCardStore'
import CardPreview from './CardPreview'
import VisualPanel from './VisualPanel'
import TemplatesPanel from './TemplatesPanel'
import Section from './Section'
import Navbar from '../components/Navbar'
import QRModal from '../components/QRModal'
import api from '../api/axios'
import { useAuth, FEATURES } from '../api/useAuth'

const FIELD_METADATA = {
  name: {
    label: 'Display Name *',
    placeholder: 'John Doe',
    icon: 'https://img.icons8.com/fluency/96/user-male-circle.png',
    type: 'text'
  },
  jobTitle: {
    label: 'Job Title',
    placeholder: 'Software Engineer',
    icon: 'https://img.icons8.com/fluency/96/manager.png',
    type: 'text'
  },
  department: {
    label: 'Department',
    placeholder: 'Engineering',
    icon: 'https://img.icons8.com/fluency/96/briefcase.png',
    type: 'text'
  },
  companyName: {
    label: 'Company Name',
    placeholder: 'Acme Corp',
    icon: 'https://img.icons8.com/fluency/96/company.png',
    type: 'text'
  },
  accreditations: {
    label: 'Accreditations',
    placeholder: 'PhD, MBA, CPA (comma-separated)',
    icon: 'https://img.icons8.com/fluency/96/certificate.png',
    type: 'text'
  },
  headline: {
    label: 'Headline',
    placeholder: 'Short bio or tagline…',
    icon: 'https://img.icons8.com/fluency/96/signature.png',
    type: 'textarea',
    maxLength: 120
  },
  email: {
    label: 'Email',
    placeholder: 'you@example.com',
    icon: 'https://img.icons8.com/fluency/96/mail.png',
    type: 'email'
  },
  phone: {
    label: 'Phone',
    placeholder: '+1 234 567 8900',
    icon: 'https://img.icons8.com/fluency/96/phone.png',
    type: 'tel'
  },
  cardSlug: {
    label: 'Public Card Slug',
    placeholder: 'john-doe',
    icon: 'https://img.icons8.com/fluency/96/fingerprint.png',
    type: 'text'
  },
  companyUrl: {
    label: 'Company URL',
    placeholder: 'https://company.com',
    icon: 'https://img.icons8.com/?size=100&id=103408&format=png&color=000000',
    type: 'url'
  },
  customLink: {
    label: 'Custom Link',
    placeholder: 'https://...',
    icon: 'https://img.icons8.com/fluency/96/link.png',
    type: 'composite',
    compositeFields: [
      { key: 'customLinkLabel', label: 'Link Label', placeholder: 'Portfolio', type: 'text' },
      { key: 'customLink', label: 'Link URL', placeholder: 'https://...', type: 'url' }
    ]
  },
  ctaUrl: {
    label: 'CTA Button',
    placeholder: 'https://...',
    icon: 'https://img.icons8.com/fluency/96/target.png',
    type: 'composite',
    compositeFields: [
      { key: 'ctaLabel', label: 'CTA Label', placeholder: 'Save Contact', type: 'text' },
      { key: 'ctaUrl', label: 'CTA URL', placeholder: 'https://...', type: 'url' }
    ]
  },
  address: {
    label: 'Address',
    placeholder: '123 Main St, City, Country',
    icon: 'https://img.icons8.com/fluency/96/map.png',
    type: 'text'
  },
  twitter: {
    label: 'X (Twitter)',
    placeholder: '@username',
    icon: 'https://img.icons8.com/color/96/twitterx.png',
    type: 'text'
  },
  instagram: {
    label: 'Instagram',
    placeholder: '@username',
    icon: 'https://img.icons8.com/?size=100&id=119026&format=png&color=000000',
    type: 'text'
  },
  threads: {
    label: 'Threads',
    placeholder: '@username',
    icon: 'https://img.icons8.com/?size=100&id=AS2a6aA9BwK3&format=png&color=000000',
    type: 'text'
  },
  linkedin: {
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/...',
    icon: 'https://img.icons8.com/color/96/linkedin.png',
    type: 'url'
  },
  facebook: {
    label: 'Facebook',
    placeholder: 'https://facebook.com/...',
    icon: 'https://img.icons8.com/color/96/facebook-new.png',
    type: 'url'
  },
  youtube: {
    label: 'YouTube',
    placeholder: 'https://youtube.com/@...',
    icon: 'https://img.icons8.com/color/96/youtube-play.png',
    type: 'url'
  },
  snapchat: {
    label: 'Snapchat',
    placeholder: '@username',
    icon: 'https://img.icons8.com/color/96/snapchat.png',
    type: 'text'
  },
  tiktok: {
    label: 'TikTok',
    placeholder: '@username',
    icon: 'https://img.icons8.com/color/96/tiktok.png',
    type: 'text'
  },
  twitch: {
    label: 'Twitch',
    placeholder: 'username',
    icon: 'https://img.icons8.com/color/96/twitch.png',
    type: 'text'
  },
  yelp: {
    label: 'Yelp',
    placeholder: 'https://yelp.com/biz/...',
    icon: 'https://img.icons8.com/color/96/yelp.png',
    type: 'url'
  },
  whatsapp: {
    label: 'WhatsApp',
    placeholder: '+1 234 567 8900',
    icon: 'https://img.icons8.com/color/96/whatsapp.png',
    type: 'tel'
  },
  signal: {
    label: 'Signal',
    placeholder: '+1 234 567 8900',
    icon: 'https://img.icons8.com/color/96/signal-app.png',
    type: 'tel'
  },
  discord: {
    label: 'Discord',
    placeholder: 'username#0000',
    icon: 'https://img.icons8.com/color/96/discord-new-logo.png',
    type: 'text'
  },
  skype: {
    label: 'Skype',
    placeholder: 'live:username',
    icon: 'https://img.icons8.com/color/96/skype.png',
    type: 'text'
  },
  telegram: {
    label: 'Telegram',
    placeholder: '@username',
    icon: 'https://img.icons8.com/color/96/telegram-app.png',
    type: 'text'
  },
  github: {
    label: 'GitHub',
    placeholder: 'https://github.com/username',
    icon: 'https://img.icons8.com/color/96/github.png',
    type: 'url'
  },
  calendly: {
    label: 'Calendly',
    placeholder: 'https://calendly.com/username',
    icon: 'https://img.icons8.com/?size=100&id=8NWIfcDnXLps&format=png&color=000000',
    type: 'url'
  },
  leadSource: {
    label: 'Lead Source',
    placeholder: 'Event, LinkedIn, Website...',
    icon: 'https://img.icons8.com/fluency/96/filter.png',
    type: 'text'
  },
  leadTags: {
    label: 'Tags',
    placeholder: 'vip, demo-request, high-intent',
    icon: 'https://img.icons8.com/fluency/96/tags.png',
    type: 'text'
  },
  followUpDate: {
    label: 'Follow-up Date',
    placeholder: '',
    icon: 'https://img.icons8.com/fluency/96/calendar.png',
    type: 'date'
  },
  meetingNote: {
    label: 'Meeting Notes',
    placeholder: 'Context to remember after first contact...',
    icon: 'https://img.icons8.com/fluency/96/edit-property.png',
    type: 'textarea',
    maxLength: 220
  }
}

const STEP_FIELDS = [
  ['name', 'jobTitle', 'department', 'companyName', 'accreditations', 'headline'],
  ['email', 'phone', 'cardSlug', 'companyUrl', 'customLink', 'ctaUrl', 'address'],
  ['twitter', 'instagram', 'threads', 'linkedin', 'facebook', 'youtube', 'snapchat', 'tiktok', 'twitch', 'yelp'],
  ['whatsapp', 'signal', 'discord', 'skype', 'telegram'],
  ['github', 'calendly'],
  ['leadSource', 'leadTags', 'followUpDate', 'meetingNote']
]

function Field({ label, name, value, onChange, type = 'text', placeholder, maxLength }) {
  return (
    <div className="w-full">
      <label className="block text-xs font-medium text-gray-500 mb-1 sm:mb-1.5">{label}</label>
      <input
        type={type}
        className="input-field text-sm w-full"
        placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        maxLength={maxLength}
      />
    </div>
  )
}

function TextareaField({ label, name, value, onChange, placeholder, maxLength }) {
  return (
    <div className="w-full">
      <label className="block text-xs font-medium text-gray-500 mb-1 sm:mb-1.5">
        {label} {maxLength && <span className="text-gray-300">({value.length}/{maxLength})</span>}
      </label>
      <textarea
        className="input-field text-sm resize-none w-full"
        rows={2}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        maxLength={maxLength}
      />
    </div>
  )
}

export default function ProfileEditor() {
  const { card, update, setAll, updateNested, updateLayout, updateLayoutImage, addCustomField, removeCustomField, updateCustomField, reorderCustomFields } = useCardStore()
  const previewRef = useRef()
  const importRef = useRef()
  const [previewVisible, setPreviewVisible] = useState(true)
  const [shareToast, setShareToast] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [serverCardId, setServerCardId] = useState(null)
  const { getFeatureLimit, canAccessFeature, user, loading: authLoading, isAdmin } = useAuth()
  const navigate = useNavigate()
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('editor')

  const sidebarLinks = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/dashboard' },
    { label: 'Editor', icon: <Pencil size={18} />, active: activeTab === 'editor', onClick: () => setActiveTab('editor') },
    { label: 'Templates', icon: <Sparkles size={18} />, active: activeTab === 'templates', onClick: () => setActiveTab('templates') },
    { label: 'Billing', icon: <CreditCard size={18} />, href: '/pricing' },
  ]

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100/80 p-5">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 mb-8 mt-1">
        <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 10C15 8.89543 15.8954 8 17 8H19C20.1046 8 21 8.89543 21 10V30C21 31.1046 20.1046 32 19 32H17C15.8954 32 15 31.1046 15 30V10Z" fill="url(#sidebarLogoGrad1)" />
          <path d="M20.5 22L28.5 30C29.281 30.781 30.5474 30.781 31.3284 30C32.1095 29.219 32.1095 27.9526 31.3284 27.1716L24.8284 20.6716C24.0474 19.8905 24.0474 18.6241 24.8284 17.8431L30.9142 11.7574C31.6953 10.9763 31.6953 9.70994 30.9142 8.92889C30.1332 8.14784 28.8668 8.14784 28.0858 8.92889L20.5 16.5" stroke="url(#sidebarLogoGrad2)" strokeWidth="5.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="sidebarLogoGrad1" x1="15" y1="8" x2="21" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="sidebarLogoGrad2" x1="20.5" y1="8" x2="31.3" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ec4899" />
              <stop offset="1" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
        </svg>
        <span className="font-extrabold text-xl text-gray-800 tracking-tight">KairavCard</span>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {sidebarLinks.map((item, idx) => (
          item.href ? (
            <Link
              key={idx}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-semibold transition-all duration-200 cursor-pointer ${
                item.active 
                  ? 'bg-[#7c3aed] text-white shadow-md shadow-purple-200/55 hover:bg-[#6d28d9]' 
                  : 'text-gray-500 hover:bg-[#7c3aed]/5 hover:text-[#7c3aed]'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <button
              key={idx}
              onClick={() => { item.onClick(); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-semibold transition-all duration-200 cursor-pointer text-left ${
                item.active 
                  ? 'bg-[#7c3aed] text-white shadow-md shadow-purple-200/55 hover:bg-[#6d28d9]' 
                  : 'text-gray-500 hover:bg-[#7c3aed]/5 hover:text-[#7c3aed]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          )
        ))}
      </nav>

      {/* Upgrade Banner Bottom Sidebar */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="bg-[#f5f3ff] rounded-2xl p-4 border border-[#e9e3ff] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#e0d8ff] rounded-full filter blur-xl opacity-60" />
          <h4 className="text-[13px] font-bold text-gray-900 leading-snug">Upgrade to<br />Advanced Plan</h4>
          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Unlock premium features and grow your business faster.</p>
          <button 
            onClick={() => { setSidebarOpen(false); navigate('/pricing') }} 
            className="w-full flex items-center justify-center gap-1.5 mt-3.5 py-2.5 bg-white border border-[#d2c5ff] hover:bg-gray-50 text-[#7c3aed] text-xs font-bold rounded-xl shadow-sm transition-all duration-200"
          >
            <Sparkles size={12} />
            Manage Plan
          </button>
        </div>
      </div>
    </div>
  )
  
  const maxSocialLinks = getFeatureLimit(FEATURES.SOCIAL_LINKS)
  const socialFields = ['twitter', 'instagram', 'threads', 'linkedin', 'facebook', 'youtube', 'snapchat', 'tiktok', 'twitch', 'yelp']
  const filledSocialLinks = socialFields.filter(field => card[field]?.trim()).length
  const [editingField, setEditingField] = useState(null)

  const isFieldFilled = (key) => {
    if (key === 'customLink') {
      return !!(card.customLink || '').trim()
    }
    if (key === 'ctaUrl') {
      return !!(card.ctaUrl || '').trim()
    }
    return !!(card[key] || '').trim()
  }

  const isFieldDisabled = (key) => {
    if (socialFields.includes(key)) {
      return maxSocialLinks !== -1 && filledSocialLinks >= maxSocialLinks && !card[key]
    }
    return false
  }

  const completionFields = ['name', 'jobTitle', 'companyName', 'email', 'phone', 'headline', 'linkedin']
  const completed = completionFields.filter((key) => (card[key] || '').trim()).length
  const completionPct = Math.round((completed / completionFields.length) * 100)

  const presets = [
    {
      id: 'sales',
      label: 'Sales Pro',
      data: {
        jobTitle: 'Sales Director',
        headline: 'Helping teams increase pipeline through smarter event networking.',
        ctaLabel: 'Save Contact',
        leadSource: 'Conference Booth',
      },
    },
    {
      id: 'founder',
      label: 'Founder',
      data: {
        jobTitle: 'Founder',
        headline: 'Building products that turn first conversations into lasting customers.',
        ctaLabel: 'Save Contact',
        leadSource: 'Warm Referral',
      },
    },
    {
      id: 'consultant',
      label: 'Consultant',
      data: {
        jobTitle: 'Business Consultant',
        headline: 'Strategy, systems, and execution support for scaling teams.',
        ctaLabel: 'Save Contact',
        leadSource: 'LinkedIn',
      },
    },
  ]

  const applyCardPayload = (payload) => {
    const safeLinks = Array.isArray(payload.links) ? payload.links : []
    const linkByType = (type) => safeLinks.find((l) => l.type === type)?.url || ''
    const metaByType = (type) => safeLinks.find((l) => l.type === type)?.url || ''
    const uploadsBase = import.meta.env.MODE === 'production'
      ? '/uploads/'
      : 'http://localhost:8000/uploads/'
    
    // Handle profile photo: check meta_profile first, then main photo field
    const profileFile = metaByType('meta_profile') || payload.photo || ''
    const coverFile   = metaByType('meta_cover') || ''
    const logoFile    = metaByType('meta_logo') || ''
    const vBgFile     = metaByType('meta_vBg_custom') || ''
    
    const social      = ['twitter', 'instagram', 'threads', 'linkedin', 'facebook', 'youtube', 'snapchat', 'tiktok', 'twitch', 'yelp']
    const messaging   = ['whatsapp', 'signal', 'discord', 'skype', 'telegram']
    const business    = ['github', 'calendly']

    const socialData = {}
    social.forEach(key => { socialData[key] = linkByType(key) })
    messaging.forEach(key => { socialData[key] = linkByType(key) })
    business.forEach(key => { socialData[key] = linkByType(key) })

    // Construct full URLs for images
    const constructImageUrl = (filename) => {
      if (!filename) return ''
      if (filename.startsWith('http')) return filename
      const cleanFile = filename.includes('uploads/') ? filename.split('uploads/').pop() : filename
      const finalFile = cleanFile.startsWith('/') ? cleanFile.substring(1) : cleanFile
      return `${uploadsBase}${finalFile}`
    }
    
    // Restore saved layout (coverHeight, profileSize, logoSize, etc.)
    const savedLayoutRaw = metaByType('meta_layout')
    let savedLayout = null
    if (savedLayoutRaw) {
      try { savedLayout = JSON.parse(savedLayoutRaw) } catch {}
    }

    // Single batch update -- one localStorage save with ALL fields including images
    const cardData = {
      name:           metaByType('meta_name')           || payload.name    || '',
      jobTitle:       payload.title                     || '',
      department:     metaByType('meta_department')     || '',
      accreditations: metaByType('meta_accreditations') || '',
      companyName:    metaByType('meta_company')        || payload.company || '',
      headline:       payload.bio                       || '',
      profilePhoto:   constructImageUrl(profileFile),
      coverPhoto:     constructImageUrl(coverFile),
      companyLogo:    constructImageUrl(logoFile),
      email:          metaByType('meta_email')          || payload.email   || '',
      phone:          linkByType('phone'),
      companyUrl:     linkByType('website'),
      customLinkLabel: safeLinks.find((l) => l.type === 'custom')?.label || '',
      customLink:     linkByType('custom'),
      address:        metaByType('meta_address')        || '',
      leadSource:     metaByType('meta_leadSource')     || '',
      leadTags:       metaByType('meta_leadTags')       || '',
      followUpDate:   metaByType('meta_followUpDate')   || '',
      meetingNote:    metaByType('meta_meetingNote')    || '',
      ctaLabel:       metaByType('meta_ctaLabel')       || '',
      ctaUrl:         metaByType('meta_ctaUrl')         || '',
      themeColor:     (() => {
        const tc = metaByType('meta_themeColor') || payload.theme || '#6366f1'
        return tc === 'default' ? '#6366f1' : tc
      })(),
      virtualBg: {
        enabled: metaByType('meta_vBg_enabled') === 'true',
        preset:  metaByType('meta_vBg_preset')  || '',
        custom:  constructImageUrl(vBgFile),
        fontColor: metaByType('meta_fontColor') || 'dark',
      },
      ...(savedLayout ? { layout: savedLayout } : {}),
      ...socialData,
    }
    
    setAll(cardData)
  }

  const toApiLinks = () => {
    const linkPairs = [
      ['phone', card.phone],
      ['website', card.companyUrl],
      ['custom', card.customLink, card.customLinkLabel || 'Custom Link'],
      ['twitter', card.twitter],
      ['instagram', card.instagram],
      ['threads', card.threads],
      ['linkedin', card.linkedin],
      ['facebook', card.facebook],
      ['youtube', card.youtube],
      ['snapchat', card.snapchat],
      ['tiktok', card.tiktok],
      ['twitch', card.twitch],
      ['yelp', card.yelp],
      ['whatsapp', card.whatsapp],
      ['signal', card.signal],
      ['discord', card.discord],
      ['skype', card.skype],
      ['telegram', card.telegram],
      ['github', card.github],
      ['calendly', card.calendly],
    ]
    return linkPairs
      .filter(([, url]) => (url || '').trim())
      .map(([type, url, label]) => ({ type, label: label || type, url }))
  }

  const extractUploadFilename = (value) => {
    if (!value) return ''
    const marker = '/uploads/'
    return value.includes(marker) ? value.split(marker).pop() : value
  }

  const uploadImageIfNeeded = async (value) => {
    if (!value) return ''
    // Already a plain filename — use as-is
    if (!value.startsWith('data:') && !value.startsWith('http') && !value.startsWith('blob:')) return value
    // Already a server URL — extract filename only, never re-upload
    if (value.startsWith('http')) return extractUploadFilename(value)
    // blob: only — never fetch arbitrary URLs
    if (!value.startsWith('blob:')) return value
    const blob = await (await fetch(value)).blob()
    const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg'
    const file = new File([blob], `upload.${ext}`, { type: blob.type || 'image/jpeg' })
    const formData = new FormData()
    formData.append('photo', file)
    const res = await api.post('/cards/upload', formData)
    return res.data.filename || ''
  }

  const saveToBackend = async () => {
    setSaving(true)
    try {
      let resolvedCardId = serverCardId
      if (!resolvedCardId) {
        try {
          // Get cardId from URL parameters
          const urlParams = new URLSearchParams(window.location.search)
          const cardId = urlParams.get('cardId')
          
          if (cardId) {
            resolvedCardId = parseInt(cardId)
            setServerCardId(resolvedCardId)
          } else {
            // Load first card if no cardId specified
            const existing = await api.get('/cards')
            const cards = existing.data.cards || []
            if (cards.length > 0) {
              resolvedCardId = cards[0].id
              setServerCardId(resolvedCardId)
            }
          }
        } catch (prefetchErr) {
          if (prefetchErr.response?.status !== 404) throw prefetchErr
        }
      }

      const profileFilename = await uploadImageIfNeeded(card.profilePhoto)
      const coverFilename = await uploadImageIfNeeded(card.coverPhoto)
      const logoFilename = await uploadImageIfNeeded(card.companyLogo)
      const virtualBgFilename = await uploadImageIfNeeded(card.virtualBg?.custom)
      const payload = {
        title: card.jobTitle || '',
        company: card.companyName || '',
        bio: card.headline || '',
        photo: profileFilename || '',
        theme: card.themeColor || 'default',
        links: [
          ...toApiLinks(),
          ...(card.name?.trim() ? [{ type: 'meta_name', label: 'Display Name', url: card.name.trim() }] : []),
          ...(card.email?.trim() ? [{ type: 'meta_email', label: 'Display Email', url: card.email.trim() }] : []),
          ...(card.companyName?.trim() ? [{ type: 'meta_company', label: 'Display Company', url: card.companyName.trim() }] : []),
          ...(card.department?.trim() ? [{ type: 'meta_department', label: 'Department', url: card.department.trim() }] : []),
          ...(card.accreditations?.trim() ? [{ type: 'meta_accreditations', label: 'Accreditations', url: card.accreditations.trim() }] : []),
          ...(card.address?.trim() ? [{ type: 'meta_address', label: 'Address', url: card.address.trim() }] : []),
          ...(card.leadSource?.trim() ? [{ type: 'meta_leadSource', label: 'Lead Source', url: card.leadSource.trim() }] : []),
          ...(card.leadTags?.trim() ? [{ type: 'meta_leadTags', label: 'Lead Tags', url: card.leadTags.trim() }] : []),
          ...(card.followUpDate?.trim() ? [{ type: 'meta_followUpDate', label: 'Follow Up Date', url: card.followUpDate.trim() }] : []),
          ...(card.meetingNote?.trim() ? [{ type: 'meta_meetingNote', label: 'Meeting Note', url: card.meetingNote.trim() }] : []),
          ...(card.ctaLabel?.trim() ? [{ type: 'meta_ctaLabel', label: 'CTA Label', url: card.ctaLabel.trim() }] : []),
          ...(card.ctaUrl?.trim() ? [{ type: 'meta_ctaUrl', label: 'CTA URL', url: card.ctaUrl.trim() }] : []),
          ...(card.themeColor?.trim() ? [{ type: 'meta_themeColor', label: 'Theme Color', url: card.themeColor.trim() }] : []),
          ...(card.layout ? [{ type: 'meta_layout', label: 'Card Layout', url: JSON.stringify(card.layout) }] : []),
          ...(card.virtualBg?.enabled ? [{ type: 'meta_vBg_enabled', label: 'Virtual BG Enabled', url: 'true' }] : []),
          ...(card.virtualBg?.preset ? [{ type: 'meta_vBg_preset', label: 'Virtual BG Preset', url: card.virtualBg.preset }] : []),
          ...(virtualBgFilename ? [{ type: 'meta_vBg_custom', label: 'Virtual BG Custom', url: virtualBgFilename }] : []),
          ...(card.virtualBg?.fontColor ? [{ type: 'meta_fontColor', label: 'Virtual BG Font Color', url: card.virtualBg.fontColor }] : []),
          ...(profileFilename ? [{ type: 'meta_profile', label: 'Profile Photo', url: profileFilename }] : []),
          ...(coverFilename ? [{ type: 'meta_cover', label: 'Cover Photo', url: coverFilename }] : []),
          ...(logoFilename ? [{ type: 'meta_logo', label: 'Company Logo', url: logoFilename }] : []),
        ],
      }
      if (resolvedCardId) {
        await api.put(`/cards/${resolvedCardId}`, payload)
      } else {
        try {
          const created = await api.post('/cards', payload)
          setServerCardId(created.data.card.id)
        } catch (createErr) {
          // Safety net: if card exists despite pre-check, switch to update seamlessly.
          if (createErr.response?.status === 409) {
            const existing = await api.get('/cards')
            const cards = existing.data.cards || []
            if (cards.length > 0) {
              const existingId = cards[0].id
              await api.put(`/cards/${existingId}`, payload)
              setServerCardId(existingId)
            } else {
              throw createErr
            }
          } else {
            throw createErr
          }
        }
      }
      
      // After save, go to dashboard to see updated card
      localStorage.removeItem('smartcard_editor')
      window.location.href = '/dashboard'
      return
    } catch (err) {
      console.error('Save to backend failed:', err)
      alert('Failed to save card. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const deleteCard = async () => {
    if (!serverCardId) {
      localStorage.removeItem('smartcard_editor')
      window.location.reload()
      return
    }
    if (!confirm('Delete this card permanently? This cannot be undone.')) return
    try {
      await api.delete(`/cards/${serverCardId}`)
      localStorage.removeItem('smartcard_editor')
      alert('Card deleted. You can create a fresh card now.')
      window.location.reload()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete card.')
    }
  }

  useEffect(() => {
    // Clear localStorage if it belongs to a different user
    const clearIfWrongUser = () => {
      try {
        const userStr = localStorage.getItem('user')
        let currentUser = {}
        if (userStr && userStr !== 'undefined') currentUser = JSON.parse(userStr)
        
        const saved = localStorage.getItem('smartcard_editor')
        if (saved && currentUser?.id) {
          const parsed = JSON.parse(saved)
          if (parsed._userId && parsed._userId !== currentUser.id) {
            localStorage.removeItem('smartcard_editor')
          }
        }
      } catch (e) {
        localStorage.removeItem('smartcard_editor')
      }
    }
    clearIfWrongUser()

    // Clean up only blob: URLs from localStorage on component mount
    const cleanupLocalStorage = () => {
      try {
        const saved = localStorage.getItem('smartcard_editor')
        if (saved) {
          const parsed = JSON.parse(saved)
          const isBlobUrl = (url) => url && url.startsWith('blob:')
          let changed = false

          if (isBlobUrl(parsed.profilePhoto)) { parsed.profilePhoto = ''; changed = true }
          if (isBlobUrl(parsed.coverPhoto)) { parsed.coverPhoto = ''; changed = true }
          if (isBlobUrl(parsed.companyLogo)) { parsed.companyLogo = ''; changed = true }
          if (isBlobUrl(parsed.virtualBg?.custom)) { parsed.virtualBg.custom = ''; changed = true }

          if (changed) localStorage.setItem('smartcard_editor', JSON.stringify(parsed))
        }
      } catch (e) {
        localStorage.removeItem('smartcard_editor')
      }
    }
    
    cleanupLocalStorage()
    
    const loadServerCard = async () => {
      try {
        // Get cardId from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const cardId = urlParams.get('cardId')
        
        if (cardId) {
          // Load specific card by ID
          const res = await api.get(`/cards/${cardId}?t=${Date.now()}`)
          const serverCard = res.data.card
          setServerCardId(serverCard.id)
          applyCardPayload(serverCard)
        } else {
          // Load first card if no cardId specified
          const res = await api.get(`/cards?t=${Date.now()}`)
          const cards = res.data.cards || []
          if (cards.length > 0) {
            const serverCard = cards[0]
            setServerCardId(serverCard.id)
            applyCardPayload(serverCard)
          }
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(err)
        }
      }
    }
    loadServerCard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const STEPS = [
    { title: 'Personal',     icon: <User size={14} />,          section: 'personal' },
    { title: 'General',      icon: <Globe size={14} />,         section: 'general' },
    { title: 'Social',       icon: <AtSign size={14} />,        section: 'social' },
    { title: 'Messaging',    icon: <MessageCircle size={14} />, section: 'messaging' },
    { title: 'Business',     icon: <Briefcase size={14} />,     section: 'business' },
    { title: 'Lead Capture', icon: <Target size={14} />,        section: 'lead' },
  ]

  const STEP_COLORS = [
    { dot: 'bg-indigo-500', active: 'bg-indigo-600 text-white border-indigo-600', done: 'bg-indigo-100 text-indigo-600 border-indigo-300', idle: 'bg-white text-gray-400 border-gray-200', bar: '#6366f1' },
    { dot: 'bg-violet-500', active: 'bg-violet-600 text-white border-violet-600', done: 'bg-violet-100 text-violet-600 border-violet-300', idle: 'bg-white text-gray-400 border-gray-200', bar: '#7c3aed' },
    { dot: 'bg-pink-500',   active: 'bg-pink-600 text-white border-pink-600',     done: 'bg-pink-100 text-pink-600 border-pink-300',     idle: 'bg-white text-gray-400 border-gray-200', bar: '#ec4899' },
    { dot: 'bg-amber-500',  active: 'bg-amber-500 text-white border-amber-500',   done: 'bg-amber-100 text-amber-600 border-amber-300',   idle: 'bg-white text-gray-400 border-gray-200', bar: '#f59e0b' },
    { dot: 'bg-teal-500',   active: 'bg-teal-600 text-white border-teal-600',     done: 'bg-teal-100 text-teal-600 border-teal-300',     idle: 'bg-white text-gray-400 border-gray-200', bar: '#14b8a6' },
    { dot: 'bg-green-500',  active: 'bg-green-600 text-white border-green-600',   done: 'bg-green-100 text-green-600 border-green-300',   idle: 'bg-white text-gray-400 border-gray-200', bar: '#22c55e' },
  ]

  const sectionProps = (section) => ({
    section,
    customFields: card.customFields[section] || [],
    onAddField: addCustomField,
    onRemoveField: removeCustomField,
    onUpdateField: updateCustomField,
    onReorderFields: reorderCustomFields,
  })

  const exportPNG = async () => {
    if (!previewRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: null })
      const link = document.createElement('a')
      link.download = `${card.name || 'smartcard'}-card.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setExporting(false)
    }
  }

  const getShareUrl = () => {
    const base = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin
    return serverCardId ? `${base}/card/id/${serverCardId}` : window.location.href
  }

  const shareLink = () => {
    navigator.clipboard.writeText(getShareUrl()).catch(() => {})
    setShareToast(true)
    setTimeout(() => setShareToast(false), 2000)
  }

  const shareWhatsApp = () => {
    const url = getShareUrl()
    window.open(`https://wa.me/?text=${encodeURIComponent(`Connect with me: ${url}`)}`, '_blank', 'noopener,noreferrer')
  }

  const shareEmail = () => {
    const url = getShareUrl()
    const subject = encodeURIComponent(`${card.name || 'My'} digital business card`)
    const body = encodeURIComponent(`Hi,\n\nYou can view my digital card here:\n${url}\n`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const downloadQR = async () => {
    const url = getShareUrl()
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(url)}`
    const res = await fetch(qrUrl)
    const blob = await res.blob()
    const fileUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = `${(card.cardSlug || card.name || 'smartcard').replace(/\s+/g, '-').toLowerCase()}-qr.png`
    link.click()
    URL.revokeObjectURL(fileUrl)
  }

  const downloadVCF = () => {
    const fullName = card.name || 'Contact'
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${fullName}`,
      card.companyName ? `ORG:${card.companyName}` : '',
      card.jobTitle ? `TITLE:${card.jobTitle}` : '',
      card.phone ? `TEL;TYPE=CELL:${card.phone}` : '',
      card.email ? `EMAIL;TYPE=INTERNET:${card.email}` : '',
      card.companyUrl ? `URL:${card.companyUrl}` : '',
      card.address ? `ADR:;;${card.address};;;;` : '',
      'END:VCARD',
    ].filter(Boolean)
    const blob = new Blob([lines.join('\n')], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${(card.name || 'smartcard').replace(/\s+/g, '-').toLowerCase()}.vcf`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(card, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${(card.name || 'smartcard').replace(/\s+/g, '-').toLowerCase()}-profile.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importJSON = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        Object.entries(data).forEach(([k, v]) => update(k, v))
        alert('Profile imported successfully!')
      } catch {
        alert('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
  }

  const applyPreset = (preset) => {
    Object.entries(preset.data).forEach(([k, v]) => update(k, v))
  }

  const clearPreset = (preset) => {
    Object.keys(preset.data).forEach(k => update(k, ''))
  }

  const isPresetApplied = (preset) =>
    Object.entries(preset.data).every(([k, v]) => (card[k] || '') === v)

  const reset = () => {
    if (confirm('Reset all card data?')) localStorage.removeItem('smartcard_editor') || window.location.reload()
  }

  return (
    <>
    <div className="flex min-h-screen bg-[#fafafc] text-gray-800 w-full">
      {/* 1. DESKTOP SIDEBAR PANEL */}
      <aside className="hidden xl:block w-72 h-screen sticky top-0 flex-shrink-0 z-30">
        {renderSidebarContent()}
      </aside>

      {/* 2. MOBILE DRAWER OVERLAY SIDEBAR */}
      {sidebarOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 max-w-sm h-full flex flex-col bg-white shadow-2xl animate-scale-in">
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="absolute top-4 right-4 p-2 bg-slate-100 text-gray-600 rounded-full hover:bg-slate-200 z-50 transition-colors"
            >
              <X size={16} />
            </button>
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* MOBILE HEADER BAR */}
        <header className="xl:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
              <path d="M15 10H21V30H15V10Z" fill="#8b5cf6" />
              <path d="M20.5 22L28.5 30L31.3 27.2L24.8 20.7L30.9 11.8L28.1 8.9L20.5 16.5" stroke="#ec4899" strokeWidth="5" />
            </svg>
            <span className="font-extrabold text-lg text-gray-800">KairavCard</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 text-gray-600 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"
          >
            <Menu size={18} />
          </button>
        </header>

        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 sticky top-[57px] xl:top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewVisible(!previewVisible)}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                previewVisible
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-300 shadow-sm'
                  : 'bg-white text-gray-600 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40'
              }`}
            >
              <Eye size={14} className="sm:text-base" />
              <span className="hidden sm:inline">Preview</span>
            </button>
            {/* Completion indicator moved into top bar */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${completionPct}%`, background: card.themeColor || '#6366f1' }} />
              </div>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${completionPct >= 80 ? 'bg-green-400' : completionPct >= 50 ? 'bg-yellow-400' : 'bg-gray-300'}`} />
              <span className="text-xs text-gray-500 font-medium">{completionPct}%</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={reset}
              className="hidden lg:flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 transition-all"
            >
              <RotateCcw size={12} className="sm:text-base" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={() => window.open(getShareUrl(), '_blank', 'noopener,noreferrer')}
              className="hidden sm:flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-200 transition-all"
            >
              <Eye size={12} className="sm:text-base" />
              <span className="hidden sm:inline">View Card</span>
            </button>
            <button
              onClick={shareLink}
              className="hidden md:flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-all"
            >
              <Share2 size={12} className="sm:text-base" />
              <span className="hidden sm:inline">Copy Link</span>
            </button>
            <button
              onClick={shareWhatsApp}
              className="hidden lg:flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-green-50 hover:text-green-600 border border-transparent hover:border-green-200 transition-all"
            >
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={shareEmail}
              className="hidden lg:flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-200 transition-all"
            >
              <span className="hidden sm:inline">Email</span>
            </button>
            <button
              onClick={() => setShowQR(true)}
              className="hidden md:flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-violet-50 hover:text-violet-600 border border-transparent hover:border-violet-200 transition-all"
            >
              <span className="hidden sm:inline">QR PNG</span>
            </button>
            <button
              onClick={saveToBackend}
              disabled={saving}
              className="btn-primary flex items-center gap-1.5 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
            >
              {saving ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Save size={12} className="sm:text-base" />
                  <span>Save Card</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

          {/* LEFT — Live Preview */}
          <div 
            className={`lg:w-[420px] lg:flex-shrink-0 lg:sticky lg:top-[72px] z-50 self-start transform-gpu 
              ${previewVisible ? 'fixed inset-0 bg-black/80 flex items-center justify-center p-4 lg:relative lg:inset-auto lg:bg-transparent lg:p-0' : 'hidden'}`}
          >
            <div className="bg-white rounded-2xl border-2 border-indigo-100 p-4 sm:p-6 shadow-xl lg:shadow-sm relative max-h-[90vh] overflow-y-auto w-full max-w-sm lg:max-w-none mx-auto">
              <button onClick={() => setPreviewVisible(false)} className="lg:hidden absolute top-3 right-3 p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 z-50">
                <X size={16}/>
              </button>
              <div className="flex flex-col gap-1 mb-3 sm:mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Live Preview</p>
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic mt-0.5 leading-relaxed">
                  💡 Tip: Right-click any element (Cover, Profile Photo, Logo, or Background) in the preview to customize it directly!
                </p>
              </div>
              <div ref={previewRef}>
                <CardPreview
                  card={card}
                  editable={true}
                  onLayoutChange={(newLayout) => update('layout', newLayout)}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — Editor */}
          <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
            {activeTab === 'templates' ? (
              <TemplatesPanel card={card} setAll={setAll} />
            ) : (
              <>
                {/* Visual customization */}
                <VisualPanel card={card} update={update} updateNested={updateNested} />

                {/* ── Stepper ── */}
                <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">

              {/* Step indicator bar */}
              <div className="flex flex-row overflow-x-auto hide-scrollbar snap-x p-3 md:flex-col md:p-5 gap-2 md:gap-1 border-b md:border-b-0 md:border-r border-slate-100 md:min-w-[220px]">
                {STEPS.map((step, i) => {
                  const c = STEP_COLORS[i]
                  const isActive = i === activeStep
                  
                  return (
                    <div key={i} className="flex flex-col items-start gap-1 snap-start whitespace-nowrap shrink-0">
                      <button
                        onClick={() => setActiveStep(i)}
                        className={`flex items-center gap-3 px-4 py-2 w-full rounded-full border text-[13px] font-bold transition-all duration-200 ${
                          isActive 
                            ? 'bg-[#5030e5] text-white border-[#5030e5] shadow-md shadow-indigo-200/50' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : c.dot}`} />
                        <span>{step.title}</span>
                      </button>
                      {i < STEPS.length - 1 && (
                        <div className="hidden md:block w-[2px] h-3 bg-slate-100 rounded-full ml-5" />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Active step content */}
              <div className="p-4 md:p-6 flex-1 min-w-0">
                {/* Step header */}
                <div className="flex items-center gap-2 mb-6">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold ${STEP_COLORS[activeStep].dot}`}>
                    {activeStep + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{STEPS[activeStep].title}</p>
                    <p className="text-xs text-gray-400">Level {activeStep + 1} of {STEPS.length}</p>
                  </div>
                </div>

                {/* Step fields */}
                <div className="w-full">
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
                    {STEP_FIELDS[activeStep].map((key) => {
                      const meta = FIELD_METADATA[key]
                      if (!meta) return null
                      const filled = isFieldFilled(key)
                      const disabled = isFieldDisabled(key)
                      
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            if (disabled) {
                              alert(`You have reached the maximum limit of ${maxSocialLinks} social links for your plan. Please upgrade your plan to add more.`)
                              return
                            }
                            setEditingField(key)
                          }}
                          className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 border-2 rounded-2xl transition-all duration-200 text-center min-h-[110px] sm:min-h-[120px] ${
                            filled 
                              ? 'border-emerald-400 bg-emerald-50/20 shadow-sm' 
                              : 'border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-md'
                          } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                        >
                          {/* Filled check badge */}
                          {filled && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white border border-white shadow-sm animate-scale-in">
                              <Check size={11} strokeWidth={3} />
                            </div>
                          )}

                          {/* Icon image */}
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2 flex-shrink-0">
                            <img
                              src={meta.icon}
                              alt={meta.label}
                              className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110"
                            />
                          </div>

                          {/* Label */}
                          <span className="text-[10px] sm:text-xs font-bold text-slate-700 group-hover:text-slate-900 line-clamp-1 w-full px-1">
                            {meta.label.replace(' *', '')}
                          </span>
                          
                          {/* Filled Value Preview */}
                          {filled && (
                            <span className="text-[9px] sm:text-[10px] text-emerald-600 font-medium mt-1 truncate max-w-full px-1">
                              {key === 'customLink' 
                                ? (card.customLinkLabel || 'Custom Link')
                                : key === 'ctaUrl'
                                ? (card.ctaLabel || 'CTA Button')
                                : card[key]}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Step 0 Quick Presets (Retained underneath) */}
                  {activeStep === 0 && (
                    <div className="pt-5 mt-5 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-400" /> Quick Presets
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {presets.map(p => {
                          const applied = isPresetApplied(p)
                          return (
                            <button
                              key={p.id}
                              onClick={() => applyPreset(p)}
                              className={`text-xs py-2 px-4 rounded-xl border-2 font-bold transition-all ${
                                applied
                                  ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm'
                                  : 'bg-white border-slate-100 text-slate-600 hover:bg-amber-50/50 hover:border-amber-200 hover:text-amber-700'
                              }`}
                            >
                              {p.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Next / Back */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setActiveStep(s => Math.max(0, s - 1))}
                    disabled={activeStep === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={15} /> Back
                  </button>
                  <span className="text-xs text-gray-400">{activeStep + 1} / {STEPS.length}</span>
                  {activeStep < STEPS.length - 1 ? (
                    <button
                      onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: STEP_COLORS[activeStep].bar }}
                    >
                      Next <ChevronRight size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={saveToBackend}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-all disabled:opacity-60"
                    >
                      <Save size={14} /> {saving ? 'Saving…' : 'Save Card'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            </>
            )}

          </div>
        </div>
      </div>
      </div>
    </div>

    {shareToast && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg z-50 flex items-center gap-2 pointer-events-none">
        <Check size={14} className="text-green-400" /> Link copied!
      </div>
    )}

    {showQR && (
      <QRModal
        cardId={serverCardId}
        userName={card.name}
        onClose={() => setShowQR(false)}
      />
    )}

    {editingField && (
      <FieldEditModal
        fieldKey={editingField}
        card={card}
        onClose={() => setEditingField(null)}
        onSave={(data) => {
          setAll(data)
        }}
      />
    )}
    </>
  )
}

function FieldEditModal({ fieldKey, card, onClose, onSave }) {
  const meta = FIELD_METADATA[fieldKey]
  if (!meta) return null

  const isComposite = meta.type === 'composite'
  const [formData, setFormData] = useState(() => {
    if (isComposite) {
      const init = {}
      meta.compositeFields.forEach(f => {
        init[f.key] = card[f.key] || ''
      })
      return init
    }
    return card[fieldKey] || ''
  })

  const inputRef = useRef(null)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleFieldChange = (key, val) => {
    if (isComposite) {
      setFormData(prev => ({ ...prev, [key]: val }))
    } else {
      setFormData(val)
    }
  }

  const handleClear = () => {
    if (isComposite) {
      const cleared = {}
      meta.compositeFields.forEach(f => {
        cleared[f.key] = ''
      })
      onSave(cleared)
    } else {
      onSave({ [fieldKey]: '' })
    }
    onClose()
  }

  const handleApply = () => {
    if (isComposite) {
      onSave(formData)
    } else {
      onSave({ [fieldKey]: formData })
    }
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && meta.type !== 'textarea') {
      e.preventDefault()
      handleApply()
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 transform transition-all flex flex-col max-h-[90vh] animate-scale-in">
        
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-50 flex flex-col items-center text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            type="button"
          >
            <X size={18} />
          </button>
          
          {/* Beautiful CDN Icon */}
          <div className="w-16 h-16 bg-slate-50 p-2.5 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-3">
            <img src={meta.icon} alt={meta.label} className="w-full h-full object-contain" />
          </div>
          
          <h3 className="text-base font-bold text-slate-800">{meta.label}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Customize your profile card field</p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {isComposite ? (
            meta.compositeFields.map((f, idx) => (
              <div key={f.key} className="w-full">
                <label className="block text-xs font-bold text-slate-500 mb-1.5">{f.label}</label>
                <input
                  ref={idx === 0 ? inputRef : null}
                  type={f.type}
                  className="input-field text-sm w-full font-medium"
                  placeholder={f.placeholder}
                  value={formData[f.key] || ''}
                  onChange={e => handleFieldChange(f.key, e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            ))
          ) : meta.type === 'textarea' ? (
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 flex justify-between">
                <span>{meta.label}</span>
                {meta.maxLength && <span className="text-slate-400 font-normal">({(formData || '').length}/{meta.maxLength})</span>}
              </label>
              <textarea
                ref={inputRef}
                className="input-field text-sm resize-none w-full font-medium"
                rows={3}
                placeholder={meta.placeholder}
                value={formData || ''}
                onChange={e => handleFieldChange(fieldKey, e.target.value)}
                maxLength={meta.maxLength}
              />
            </div>
          ) : (
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-500 mb-1.5">{meta.label}</label>
              <input
                ref={inputRef}
                type={meta.type}
                className="input-field text-sm w-full font-medium"
                placeholder={meta.placeholder}
                value={formData || ''}
                onChange={e => handleFieldChange(fieldKey, e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 size={13} /> Clear
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all btn-primary"
            >
              Apply
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

