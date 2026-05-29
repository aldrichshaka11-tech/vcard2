import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutTemplate, LayoutDashboard, Pencil, CreditCard,
  Sparkles, Check, X, Menu, ChevronRight, LogOut, Eye
} from 'lucide-react'
import api from '../api/axios'

import templateMaroon from '../assets/template_maroon.png'
import templateBlue from '../assets/template_blue.png'
import templateOrange from '../assets/template_orange.png'
import templateTeal from '../assets/template_teal.png'

const TEMPLATES = [
  {
    id: 'maroon_elegance',
    name: 'Maroon Elegance',
    description: 'Geometric maroon/pink borders with circular yellow accent.',
    thumbnail: templateMaroon,
    badge: 'Popular',
    badgeColor: 'bg-rose-100 text-rose-600',
    themeColor: '#9d174d',
    virtualBg: { enabled: true, preset: '', custom: 'template_maroon.png', fontColor: 'dark' },
    layout: { coverHeight: 160, overlap: 60, profileSize: 96, logoSize: 56, cardBgColor: '', cover: { zoom: 1.0, x: 50, y: 50 }, profile: { zoom: 1.0, x: 50, y: 50 }, logo: { zoom: 1.0, x: 50, y: 50 } }
  },
  {
    id: 'corporate_blue',
    name: 'Geometric Colorful',
    description: 'Energetic multicolor geometric shapes for a vibrant look.',
    thumbnail: templateBlue,
    badge: 'Common',
    badgeColor: 'bg-blue-100 text-blue-600',
    themeColor: '#db2777',
    virtualBg: { enabled: true, preset: '', custom: 'template_blue.png', fontColor: 'dark' },
    layout: { coverHeight: 160, overlap: 55, profileSize: 96, logoSize: 56, cardBgColor: '', cover: { zoom: 1.0, x: 50, y: 50 }, profile: { zoom: 1.0, x: 50, y: 50 }, logo: { zoom: 1.0, x: 50, y: 50 } }
  },
  {
    id: 'sunset_gradient',
    name: 'Navy Orange',
    description: 'Dynamic navy blue and orange geometric theme.',
    thumbnail: templateOrange,
    badge: 'Common',
    badgeColor: 'bg-orange-100 text-orange-600',
    themeColor: '#ea580c',
    virtualBg: { enabled: true, preset: '', custom: 'template_orange.png', fontColor: 'dark' },
    layout: { coverHeight: 160, overlap: 55, profileSize: 96, logoSize: 56, cardBgColor: '', cover: { zoom: 1.0, x: 50, y: 50 }, profile: { zoom: 1.0, x: 50, y: 50 }, logo: { zoom: 1.0, x: 50, y: 50 } }
  },
  {
    id: 'modern_teal',
    name: 'Abstract Shapes',
    description: 'Vibrant pink, purple, and orange geometric elements.',
    thumbnail: templateTeal,
    badge: 'Common',
    badgeColor: 'bg-teal-100 text-teal-600',
    themeColor: '#ec4899',
    virtualBg: { enabled: true, preset: '', custom: 'template_teal.png', fontColor: 'dark' },
    layout: { coverHeight: 160, overlap: 55, profileSize: 96, logoSize: 56, cardBgColor: '', cover: { zoom: 1.0, x: 50, y: 50 }, profile: { zoom: 1.0, x: 50, y: 50 }, logo: { zoom: 1.0, x: 50, y: 50 } }
  }
]

const PUBLIC_BASE = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin

export default function Templates() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cards, setCards] = useState([])
  const [applying, setApplying] = useState(null)
  const [appliedId, setAppliedId] = useState(null)
  const [savedCardId, setSavedCardId] = useState(null)

  useEffect(() => {
    api.get('/cards').then(r => setCards(r.data.cards || [])).catch(() => {})
  }, [])

  const firstCard = cards[0] || null
  const firstCardId = firstCard?.id || null

  const sidebarLinks = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/dashboard' },
    { label: 'Editor', icon: <Pencil size={18} />, href: firstCardId ? `/editor?cardId=${firstCardId}` : '/editor' },
    { label: 'Templates', icon: <LayoutTemplate size={18} />, active: true, href: '/templates' },
    { label: 'Billing', icon: <CreditCard size={18} />, href: '/pricing' },
  ]

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('smartcard_editor')
    window.location.href = '/'
  }

  // Preserve existing card links, replace only template-related meta links
  const buildLinks = (card, template) => {
    const TEMPLATE_META = ['meta_themeColor', 'meta_vBg_enabled', 'meta_vBg_preset', 'meta_vBg_custom', 'meta_fontColor', 'meta_layout']
    const kept = (card.links || []).filter(l => !TEMPLATE_META.includes(l.type))
    const newMeta = [
      { type: 'meta_themeColor', label: 'Theme Color', url: template.themeColor },
      { type: 'meta_layout', label: 'Card Layout', url: JSON.stringify(template.layout) },
      { type: 'meta_fontColor', label: 'Virtual BG Font Color', url: template.virtualBg.fontColor },
      { type: 'meta_vBg_enabled', label: 'Virtual BG Enabled', url: 'true' },
      { type: 'meta_vBg_custom', label: 'Virtual BG Custom', url: template.virtualBg.custom },
    ]
    return [...kept, ...newMeta]
  }

  const applyTemplate = async (template) => {
    if (!firstCard) return
    setApplying(template.id)
    try {
      await api.put(`/cards/${firstCard.id}`, {
        title: firstCard.title || '',
        company: firstCard.company || '',
        bio: firstCard.bio || '',
        photo: firstCard.photo || '',
        theme: template.themeColor,
        links: buildLinks(firstCard, template)
      })
      // Clear localStorage so editor reloads fresh from server
      localStorage.removeItem('smartcard_editor')
      setAppliedId(template.id)
      setSavedCardId(firstCard.id)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to apply template.')
    } finally {
      setApplying(null)
    }
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100/80 p-5">
      <div className="flex items-center gap-3 px-2 mb-8 mt-1">
        <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 40 40" fill="none">
          <path d="M15 10C15 8.89543 15.8954 8 17 8H19C20.1046 8 21 8.89543 21 10V30C21 31.1046 20.1046 32 19 32H17C15.8954 32 15 31.1046 15 30V10Z" fill="url(#tLogoG1)" />
          <path d="M20.5 22L28.5 30C29.281 30.781 30.5474 30.781 31.3284 30C32.1095 29.219 32.1095 27.9526 31.3284 27.1716L24.8284 20.6716C24.0474 19.8905 24.0474 18.6241 24.8284 17.8431L30.9142 11.7574C31.6953 10.9763 31.6953 9.70994 30.9142 8.92889C30.1332 8.14784 28.8668 8.14784 28.0858 8.92889L20.5 16.5" stroke="url(#tLogoG2)" strokeWidth="5.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="tLogoG1" x1="15" y1="8" x2="21" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8b5cf6" /><stop offset="1" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="tLogoG2" x1="20.5" y1="8" x2="31.3" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ec4899" /><stop offset="1" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
        </svg>
        <span className="font-extrabold text-xl text-gray-800 tracking-tight">KairavCard</span>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {sidebarLinks.map((item, idx) => (
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
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="bg-[#f5f3ff] rounded-2xl p-4 border border-[#e9e3ff] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#e0d8ff] rounded-full filter blur-xl opacity-60" />
          <h4 className="text-[13px] font-bold text-gray-900 leading-snug">Upgrade to<br />Advanced Plan</h4>
          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Unlock premium features and grow your business faster.</p>
          <button
            onClick={() => { setSidebarOpen(false); navigate('/pricing') }}
            className="w-full flex items-center justify-center gap-1.5 mt-3.5 py-2.5 bg-white border border-[#d2c5ff] hover:bg-gray-50 text-[#7c3aed] text-xs font-bold rounded-xl shadow-sm transition-all duration-200"
          >
            <Sparkles size={12} /> Manage Plan
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#fafafc] text-gray-800">

      {/* Desktop Sidebar */}
      <aside className="hidden xl:block w-72 h-screen sticky top-0 flex-shrink-0 z-30">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 max-w-sm h-full flex flex-col bg-white shadow-2xl">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-gray-600 rounded-full hover:bg-slate-200 z-50">
              <X size={16} />
            </button>
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Header */}
        <header className="xl:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
              <path d="M15 10H21V30H15V10Z" fill="#8b5cf6" />
              <path d="M20.5 22L28.5 30L31.3 27.2L24.8 20.7L30.9 11.8L28.1 8.9L20.5 16.5" stroke="#ec4899" strokeWidth="5" />
            </svg>
            <span className="font-extrabold text-lg text-gray-800">KairavCard</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all">
            <Menu size={18} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <LayoutTemplate size={28} className="text-[#7c3aed]" />
                Templates
              </h1>
              <p className="text-sm text-gray-400 font-semibold mt-1">Select a template — it saves instantly to your card.</p>
            </div>
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-md transition-all">
              <LogOut size={14} /> Logout
            </button>
          </div>

          {/* No card warning */}
          {cards.length === 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm font-semibold text-amber-700 flex items-center gap-2">
              ⚠️ You don't have a card yet. <Link to="/dashboard" className="underline">Create one first</Link> to apply templates.
            </div>
          )}

          {/* Success banner */}
          {appliedId && savedCardId && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-semibold text-emerald-700 flex items-center justify-between gap-3">
              <span>✅ Template applied and saved successfully!</span>
              <a
                href={`${PUBLIC_BASE}/card/id/${savedCardId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap"
              >
                <Eye size={13} /> View Card
              </a>
            </div>
          )}

          {/* Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEMPLATES.map((template) => {
              const isApplied = appliedId === template.id
              const isApplying = applying === template.id

              return (
                <div
                  key={template.id}
                  className={`group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-2 ${
                    isApplied ? 'border-[#7c3aed] scale-[1.02]' : 'border-gray-100 hover:border-[#7c3aed]/30 hover:-translate-y-1'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden h-[260px] sm:h-[320px]">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className={`absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${template.badgeColor}`}>
                      {template.badge}
                    </span>
                    {isApplied && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-[#7c3aed] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Info + CTA */}
                  <div className="p-4">
                    <h3 className="text-sm font-black text-gray-800 tracking-tight">{template.name}</h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-1 leading-relaxed line-clamp-2">{template.description}</p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => applyTemplate(template)}
                        disabled={isApplying || cards.length === 0}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isApplied
                            ? 'bg-[#7c3aed] text-white shadow-md'
                            : 'bg-[#f5f3ff] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white border border-[#e9e3ff] hover:border-[#7c3aed]'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isApplying ? (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isApplied ? (
                          <><Check size={13} /> Applied</>
                        ) : (
                          <>Use Template <ChevronRight size={13} /></>
                        )}
                      </button>

                      {isApplied && savedCardId && (
                        <a
                          href={`${PUBLIC_BASE}/card/id/${savedCardId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-all"
                          title="View Card"
                        >
                          <Eye size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </main>
      </div>
    </div>
  )
}
