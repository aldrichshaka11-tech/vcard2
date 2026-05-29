import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Eye, QrCode, Pencil, TrendingUp, ExternalLink, Sparkles, Trash2, Share2, Copy, Check, 
  Users, BarChart2, Plus, ArrowUpRight, Mail, Phone, MessageSquare, X, LayoutDashboard, 
  CreditCard, Settings, HelpCircle, Bell, LogOut, ChevronRight, ChevronLeft, Menu, LayoutTemplate 
} from 'lucide-react'
import api from '../api/axios'
import QRModal from '../components/QRModal'
import { useAuth } from '../api/useAuth'

export default function Dashboard() {
  const { user, isAdmin, loading: authLoading, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [creating, setCreating] = useState(false)
  const [leads, setLeads] = useState([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [deletingLead, setDeletingLead] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Profile Edit Modal States
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')

  const PUBLIC_BASE = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin
  const publicUrl = selectedCard ? `${PUBLIC_BASE}/card/id/${selectedCard.id}` : ''
  const uploadsBase = import.meta.env.MODE === 'production'
    ? '/uploads/'
    : 'http://localhost:8000/uploads/'

  useEffect(() => {
    if (showEditProfile && user) {
      setProfileName(user.name || '')
      setProfileEmail(user.email || '')
      setAvatarFile(null)
      setAvatarPreview(user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${uploadsBase}${user.avatar}`) : '')
      setProfileError('')
      setProfileSuccess(false)
    }
  }, [showEditProfile, user])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!profileName.trim() || !profileEmail.trim()) {
      setProfileError('Name and email are required.')
      return
    }
    setSavingProfile(true)
    setProfileError('')
    try {
      let uploadedFilename = user?.avatar || null
      
      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)
        const uploadRes = await api.post('/auth/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        uploadedFilename = uploadRes.data.filename
      }

      await api.put('/auth/profile', {
        name: profileName.trim(),
        email: profileEmail.trim(),
        avatar: uploadedFilename
      })

      await refreshUser()
      setProfileSuccess(true)
      setTimeout(() => {
        setShowEditProfile(false)
      }, 1500)
    } catch (err) {
      console.error(err)
      setProfileError(err.response?.data?.error || 'Failed to update profile. Please try again.')
    } finally {
      setSavingProfile(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) return
    if (isAdmin()) return
  }, [user, authLoading])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cardsRes = await api.get('/cards')
        const userCards = cardsRes.data.cards || []
        setCards(userCards)
        if (userCards.length > 0) {
          setSelectedCard(userCards[0])
          api.get(`/analytics?card_id=${userCards[0].id}`).then(r => setAnalytics(r.data)).catch(() => {})
          fetchLeads(userCards[0].id)
        }
      } catch (err) {
        if (err.response?.status !== 404) console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const handleFocus = async () => {
      try {
        const cardsRes = await api.get('/cards')
        const userCards = cardsRes.data.cards || []
        setCards(userCards)
        if (selectedCard) {
          const found = userCards.find(c => c.id === selectedCard.id)
          if (found) api.get(`/analytics?card_id=${found.id}`).then(r => setAnalytics(r.data)).catch(() => {})
        }
      } catch {}
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [selectedCard])

  const copyLink = async () => {
    if (!publicUrl) return
    await navigator.clipboard.writeText(publicUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteCard = async () => {
    if (!selectedCard?.id || !confirm('Delete this card permanently?')) return
    setDeleting(true)
    try {
      await api.delete(`/cards/${selectedCard.id}`)
      const remaining = cards.filter(c => c.id !== selectedCard.id)
      setCards(remaining)
      setSelectedCard(remaining[0] || null)
      setAnalytics(null)
      if (remaining[0]) api.get(`/analytics?card_id=${remaining[0].id}`).then(r => setAnalytics(r.data)).catch(() => {})
      localStorage.removeItem('smartcard_editor')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete card.')
    } finally {
      setDeleting(false)
    }
  }

  const hasPlan = isAdmin() || user?.plan_status === 'active'

  const createNewCard = async () => {
    if (!hasPlan) { navigate('/pricing'); return }
    setCreating(true)
    try {
      const res = await api.post('/cards', { title: `Business Card ${cards.length + 1}`, company: '', bio: '', photo: '', theme: 'default' })
      window.location.href = `/editor?cardId=${res.data.card.id}`
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create new card.')
      setCreating(false)
    }
  }

  const fetchLeads = (cardId) => {
    setLeadsLoading(true)
    api.get(`/leads?card_id=${cardId}`)
      .then(r => setLeads(r.data.leads || []))
      .catch(() => setLeads([]))
      .finally(() => setLeadsLoading(false))
  }

  const deleteLead = async (leadId) => {
    setDeletingLead(leadId)
    try {
      await api.delete(`/leads/${leadId}`)
      setLeads(prev => prev.filter(l => l.id !== leadId))
    } catch {}
    finally { setDeletingLead(null) }
  }

  const selectCard = (card) => {
    setSelectedCard(card)
    api.get(`/analytics?card_id=${card.id}`).then(r => setAnalytics(r.data)).catch(() => setAnalytics(null))
    fetchLeads(card.id)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('smartcard_editor')
    window.location.href = '/'
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#fafafc]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Loading your space…</p>
      </div>
    </div>
  )

  const activeIndex = cards.findIndex(c => c.id === selectedCard?.id)
  const prevCard = () => { if (activeIndex > 0) selectCard(cards[activeIndex - 1]) }
  const nextCard = () => { if (activeIndex < cards.length - 1) selectCard(cards[activeIndex + 1]) }

  const totalViews = analytics?.total_views ?? 28
  const weekViews = analytics?.last_7_days?.reduce((s, d) => s + d.views, 0) ?? 0
  const avgViews = analytics?.last_7_days?.length ? Math.round(weekViews / 7) : 0

  const stats = [
    { label: 'Total Views', value: totalViews, icon: <Eye size={16} />, color: 'text-white', bg: 'bg-indigo-600 shadow-indigo-100/50', change: '↑ 12% vs last 7 days', success: true },
    { label: 'This Week', value: weekViews, icon: <TrendingUp size={16} />, color: 'text-white', bg: 'bg-violet-600 shadow-purple-100/50', change: '— 0% vs last 7 days', success: false },
    { label: 'Total Leads', value: leads.length, icon: <Users size={16} />, color: 'text-white', bg: 'bg-pink-600 shadow-pink-100/50', change: '— 0% vs last 7 days', success: false },
    { label: 'Avg / Day', value: avgViews, icon: <BarChart2 size={16} />, color: 'text-white', bg: 'bg-teal-600 shadow-teal-100/50', change: '— 0% vs last 7 days', success: false },
  ]

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  // Dynamic profile progress calculation (based on how filled the selectedCard is)
  const calculateProgress = () => {
    if (!selectedCard) return 30
    let filledFields = 0
    const fieldsToTrack = ['title', 'company', 'bio', 'photo']
    fieldsToTrack.forEach(f => { if (selectedCard[f]) filledFields++ })
    if (leads.length > 0) filledFields++
    return 30 + (filledFields * 10) // base 30% + 10% for each detail, caps at 100
  }
  const progressPercent = calculateProgress()

  // Sidebar links lists matching the mockup
  const sidebarLinks = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, active: true, href: '/dashboard' },
    { label: 'Editor', icon: <Pencil size={18} />, href: selectedCard ? `/editor?cardId=${selectedCard.id}` : '/editor' },
    { label: 'Templates', icon: <LayoutTemplate size={18} />, href: '/templates' },
    { label: 'Billing', icon: <CreditCard size={18} />, href: '/pricing' },
  ]

  // Render SVG views chart
  const renderViewsChart = () => {
    const hasData = weekViews > 0
    const chartDays = hasData && analytics?.last_7_days?.length > 0
      ? analytics.last_7_days
      : [
          { date: 'May 19', views: 0 },
          { date: 'May 20', views: 0 },
          { date: 'May 21', views: 0 },
          { date: 'May 22', views: 0 },
          { date: 'May 23', views: 0 },
          { date: 'May 24', views: 0 },
          { date: 'May 25', views: 0 }
        ]

    const maxVal = Math.max(...chartDays.map(x => x.views), 15)
    const width = 500
    const height = 150
    const paddingX = 40
    const paddingY = 20
    const plotWidth = width - paddingX * 2
    const plotHeight = height - paddingY * 2
    
    const points = chartDays.map((d, idx) => {
      const x = paddingX + (idx / (chartDays.length - 1)) * plotWidth
      const y = height - paddingY - (d.views / maxVal) * plotHeight
      return { x, y, ...d }
    })
    
    const pathD = points.reduce((acc, p, idx) => {
      if (idx === 0) return `M ${p.x} ${p.y}`
      return `${acc} L ${p.x} ${p.y}`
    }, '')

    const fillD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : ''

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Y Axis Grid lines and labels */}
        {[0, 0.33, 0.66, 1].map((ratio, idx) => {
          const y = paddingY + ratio * plotHeight
          const val = Math.round(maxVal - ratio * maxVal)
          return (
            <g key={idx} className="opacity-40">
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
              <text x={paddingX - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400 font-semibold">{val}</text>
            </g>
          )
        })}
        
        {/* Fill under path */}
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {fillD && <path d={fillD} fill="url(#chartGradient)" />}

        {/* Path line */}
        <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Circles & dates */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="4" fill="#8b5cf6" stroke="white" strokeWidth="1.5" className="transition-all duration-200 group-hover:r-6" />
            <circle cx={p.x} cy={p.y} r="8" fill="#8b5cf6" className="opacity-0 group-hover:opacity-10 transition-all duration-200" />
            <text x={p.x} y={height - paddingY + 14} textAnchor="middle" className="text-[9px] fill-gray-400 font-bold">{p.date?.slice(5) || p.date}</text>
          </g>
        ))}
      </svg>
    )
  }

  // Common Sidebar render
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

  return (
    <div className="flex min-h-screen bg-[#fafafc] text-gray-800">
      
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

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
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

        {/* MAIN BODY SCROLLABLE GRID */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* TOP ACTIONS / NOTIFICATIONS BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
              <p className="text-xs sm:text-sm font-semibold text-gray-400 mt-0.5">{currentDateFormatted}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* + New Card Button */}
              <button 
                onClick={createNewCard}
                disabled={creating}
                className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] border border-[#7c3aed] disabled:opacity-60 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                New Card
              </button>

              {/* Notification icon */}
              <button className="w-10 h-10 rounded-xl bg-white border border-gray-100/80 shadow-sm flex items-center justify-center relative text-gray-500 hover:text-indigo-600 hover:border-indigo-100 hover:scale-105 active:scale-95 transition-all">
                <Bell size={17} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              </button>

              {/* User badge */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-gray-100/80 rounded-xl shadow-sm cursor-default">
                {user?.avatar ? (
                  <img 
                    src={user.avatar.startsWith('http') ? user.avatar : `${uploadsBase}${user.avatar}`} 
                    alt={user.name} 
                    className="w-7 h-7 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {user?.name?.[0]?.toUpperCase() || 'V'}
                  </div>
                )}
                <div className="flex flex-col pr-1">
                  <span className="text-[12px] font-bold text-gray-800 leading-none">{user?.name || 'vijaykumar'}</span>
                  <span className="text-[9px] font-extrabold text-[#7c3aed] uppercase tracking-wider mt-0.5">
                    {isAdmin() ? 'ADMIN' : (user?.role === 'advanced' ? 'ADV' : (user?.role === 'pro' ? 'PRO' : (user?.role === 'basic' ? 'BASIC' : (user?.role ? user.role.toUpperCase() : 'BASIC'))))}
                  </span>
                </div>
              </div>

              {/* Logout button */}
              <button 
                onClick={logout} 
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-500 hover:bg-red-600 border border-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>

          {/* DUAL WORKSPACE LAYOUT (Center + Right Side columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 3A. CENTER MAIN WORKSPACE (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* HELLO BANNER (Purple Gradient + Progress Ring) */}
              <div className="bg-gradient-to-br from-[#7c3aed] via-[#8b5cf6] to-[#9333ea] rounded-3xl p-6 sm:p-7 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl shadow-purple-100/60 border border-purple-400/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full filter blur-xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-900/10 rounded-full filter blur-2xl pointer-events-none" />
                
                {/* Left Cardholder Mockup & Message */}
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10 w-full md:w-auto">
                  {/* Styled 3D Wallet SVG */}
                  <div className="w-24 h-18 bg-gradient-to-br from-amber-300 to-orange-400 rounded-2xl relative shadow-lg flex items-center justify-center flex-shrink-0 border-2 border-white/20 transform hover:scale-105 transition-all duration-300">
                    <div className="w-9 h-5 bg-white/30 rounded-md absolute top-2.5 left-2.5 flex flex-col gap-1 p-0.5">
                      <div className="w-4 h-0.5 bg-white rounded-full"></div>
                      <div className="w-2.5 h-0.5 bg-white rounded-full"></div>
                    </div>
                    <div className="w-16 h-10 bg-amber-500 rounded-xl absolute -bottom-1.5 -right-1.5 shadow-md border border-white/10 flex items-center justify-end px-2">
                      <div className="w-3.5 h-3.5 bg-orange-600 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      👋 Hello, {user?.name?.split(' ')[0] || 'vijaykumar'}
                    </h2>
                    <p className="text-white/80 text-xs sm:text-sm max-w-md font-semibold leading-relaxed">
                      Welcome back! You have {totalViews} total views on your cards and your profile is {progressPercent}% complete.
                    </p>
                  </div>
                </div>

                {/* Right Circular Gauge */}
                <div className="flex-shrink-0 flex flex-col items-center z-10">
                  <div className="relative w-22 h-22 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 88 88">
                      <circle cx="44" cy="44" r="36" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="6.5" fill="transparent" />
                      <circle cx="44" cy="44" r="36" stroke="white" strokeWidth="6.5" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 36}
                        strokeDashoffset={2 * Math.PI * 36 * (1 - progressPercent / 100)}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-lg font-black text-white">{progressPercent}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-white/90 mt-1.5 uppercase tracking-wider">Profile Progress</span>
                </div>
              </div>

              {/* 4 KPI METRIC STATS CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((s, idx) => (
                  <div key={idx} className="bg-white border border-gray-100/90 rounded-3xl p-4.5 shadow-sm hover:shadow-md hover:border-purple-100 hover:-translate-y-0.5 transition-all duration-200 cursor-default group">
                    <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center ${s.color} mb-3.5 group-hover:scale-110 transition-transform shadow-sm`}>
                      {s.icon}
                    </div>
                    <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">{s.value}</p>
                    <p className="text-xs font-bold text-gray-400 mt-1">{s.label}</p>
                    <span className="inline-block text-[9px] font-extrabold mt-3.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                      {s.change}
                    </span>
                  </div>
                ))}
              </div>

              {/* GRAPH + LIVE PREVIEW SLIDER GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. VIEWS CHART */}
                <div className="bg-white border border-gray-100/90 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-200">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 leading-tight">Views — Last 7 days</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">{weekViews} total · <span className="text-[#7c3aed] cursor-pointer hover:underline">Full history</span></p>
                      </div>
                    </div>
                    
                    {/* Time select dropdown button */}
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-100 text-gray-600 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-100 active:scale-95 transition-all cursor-pointer">
                      Last 7 days
                    </button>
                  </div>

                  {/* SVG Line plot */}
                  <div className="h-32 flex items-end">
                    {renderViewsChart()}
                  </div>
                </div>

                {/* 2. SLIDING LIVE PREVIEW */}
                <div className="bg-white border border-gray-100/90 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <p className="text-sm font-bold text-gray-800 leading-tight">Live Preview</p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Link 
                        to={hasPlan && selectedCard ? `/editor?cardId=${selectedCard.id}` : '/pricing'} 
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#7c3aed] hover:bg-purple-50 border border-transparent hover:border-purple-100 rounded-lg transition-all"
                      >
                        <Pencil size={11} /> Edit
                      </Link>
                      <button 
                        onClick={handleDeleteCard} 
                        disabled={deleting} 
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <Trash2 size={11} /> {deleting ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  {selectedCard ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-2.5xl p-4.5 flex flex-col justify-between h-[230px] shadow-inner">
                      {/* Mini visual mockup of card matching pink design */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-sm relative overflow-hidden flex gap-4 h-38">
                        <div 
                          className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-r from-pink-500 to-rose-400" 
                          style={{ 
                            background: selectedCard.theme === 'default' 
                              ? 'linear-gradient(135deg, #7c3aed, #a78bfa)' 
                              : selectedCard.theme === 'dark' 
                                ? '#1e293b' 
                                : selectedCard.theme || 'linear-gradient(135deg, #e0538a, #f472b6)' 
                          }} 
                        />
                        
                        {/* Circle badge */}
                        <div className="flex flex-col items-center justify-end z-10 mt-1">
                          <div 
                            className="w-15 h-15 rounded-full border-4 border-white bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white text-xl font-black shadow-md"
                            style={{ 
                              background: selectedCard.theme === 'default' 
                                ? '#7c3aed' 
                                : selectedCard.theme === 'dark' 
                                  ? '#334155' 
                                  : selectedCard.theme || '#e0538a' 
                            }}
                          >
                            {selectedCard.name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'A'}
                          </div>
                        </div>
                        
                        {/* Bio/Info details */}
                        <div className="flex-1 z-10 pt-7.5 min-w-0 flex flex-col justify-center">
                          <h4 className="text-[15px] font-black text-gray-800 truncate leading-tight">
                            {selectedCard.name || user?.name || 'Arunkumar'}
                          </h4>
                          <p className="text-[11px] font-bold text-gray-400 truncate mt-0.5">{selectedCard.title || 'Business Card 2'}</p>
                          <p className="text-[10px] font-semibold text-gray-500 truncate leading-none mt-1">{selectedCard.bio || 'Mba'}</p>
                          
                          {/* Location pin indicator */}
                          <p className="text-[10px] font-bold text-gray-400 flex items-center gap-0.5 truncate mt-2 leading-none">
                            <span className="text-red-400">📍</span> {selectedCard.company || '628501'}
                          </p>
                        </div>
                      </div>

                      {/* Sliding dots navigation controller */}
                      <div className="flex items-center justify-center gap-4 mt-2">
                        <button 
                          onClick={prevCard} 
                          disabled={activeIndex <= 0} 
                          className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:scale-100 shadow-sm hover:scale-105 active:scale-95 transition-all"
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <div className="flex items-center gap-1.5">
                          {cards.map((c, i) => (
                            <span 
                              key={c.id} 
                              onClick={() => selectCard(c)} 
                              className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${i === activeIndex ? 'bg-[#7c3aed] w-4' : 'bg-gray-200 hover:bg-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <button 
                          onClick={nextCard} 
                          disabled={activeIndex >= cards.length - 1} 
                          className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:scale-100 shadow-sm hover:scale-105 active:scale-95 transition-all"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm font-semibold text-gray-400">No card available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CONTACTS LIST ROW */}
              <div className="bg-white border border-gray-100/90 rounded-3xl shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-pink-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                      <Users size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 leading-tight">Contacts Received</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">{leads.length} people shared details</p>
                    </div>
                  </div>
                </div>

                {leadsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-7 h-7 border-3 border-pink-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : leads.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-2.5">
                    {/* Stylised Illustration */}
                    <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
                      📭
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-600">No contacts yet</p>
                      <p className="text-[11px] text-gray-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                        When visitors submit their details on your public card, they'll appear here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50 max-h-[250px] overflow-y-auto pr-1">
                    {leads.map(lead => (
                      <div key={lead.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                        <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-indigo-50 to-violet-100 border border-indigo-100/50 flex items-center justify-center text-xs font-black text-indigo-600 flex-shrink-0 shadow-sm">
                          {lead.lead_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 leading-tight">{lead.lead_name}</p>
                          <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1 leading-none">
                            {lead.lead_email && (
                              <a href={`mailto:${lead.lead_email}`} className="flex items-center gap-0.5 text-[10px] font-bold text-[#7c3aed] hover:underline">
                                <Mail size={9} /> {lead.lead_email}
                              </a>
                            )}
                            {lead.lead_phone && (
                              <a href={`tel:${lead.lead_phone}`} className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 hover:underline">
                                <Phone size={9} /> {lead.lead_phone}
                              </a>
                            )}
                          </div>
                          {lead.lead_note && (
                            <p className="text-[10px] text-gray-400 italic mt-1.5 flex items-center gap-0.5 leading-snug">
                              <MessageSquare size={9} className="flex-shrink-0" /> {lead.lead_note}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => deleteLead(lead.id)}
                          disabled={deletingLead === lead.id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 flex-shrink-0"
                          title="Delete lead"
                        >
                          {deletingLead === lead.id
                            ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <X size={13} />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* 3B. RIGHT SIDE WIDGETS COLUMN (4 Columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* PROFILE WIDGET (Dual Spin Ring avatar) */}
              <div className="bg-white border border-gray-100/90 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-200 relative overflow-hidden">
                <button 
                  onClick={() => setShowEditProfile(true)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 font-black text-lg leading-none cursor-pointer"
                >
                  •••
                </button>
                
                <h3 className="text-sm font-bold text-gray-800 mb-6 leading-tight">My Profile</h3>

                <div className="flex flex-col items-center text-center">
                  
                  {/* Dotted spin ring avatar */}
                  <div className="relative mb-4 mt-2">
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/80 animate-[spin_20s_linear_infinite]" />
                    <div className="absolute -inset-1 rounded-full border border-dashed border-pink-400/60 animate-[spin_10s_linear_infinite_reverse]" />
                    <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 p-0.5 relative z-10 flex items-center justify-center shadow-lg">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center text-indigo-600 font-extrabold text-2xl border border-white shadow-inner">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar.startsWith('http') ? user.avatar : `${uploadsBase}${user.avatar}`} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user?.name?.[0]?.toUpperCase() || 'V'
                        )}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-[16px] font-black text-gray-800 tracking-tight">{user?.name || 'vijaykumar'}</h4>
                  
                  <span className="inline-block mt-2.5 px-3 py-1 bg-[#7c3aed] text-white text-[9px] font-extrabold rounded-full tracking-wider shadow-md uppercase border border-[#7c3aed]">
                    {isAdmin() ? 'ADMIN' : (user?.role === 'advanced' ? 'ADVANCED PLAN' : (user?.role === 'pro' ? 'PRO PLAN' : (user?.role === 'basic' ? 'BASIC PLAN' : (user?.role ? `${user.role.toUpperCase()} PLAN` : 'BASIC PLAN'))))}
                  </span>

                  <p className="text-xs text-gray-400 font-semibold mt-3 truncate w-full max-w-[220px]">
                    {user?.email || 'vijaykumar@example.com'}
                  </p>

                  <button 
                    onClick={() => setShowEditProfile(true)}
                    className="mt-4.5 px-4.5 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Pencil size={12} />
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* QUICK ACTIONS WIDGET */}
              <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">Quick Actions</h4>
                  {/* Premium Spark SVG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="select-none pointer-events-none">
                    <line x1="8" y1="20" x2="4" y2="14" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="13" y1="20" x2="13" y2="11" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="18" y1="20" x2="22" y2="16" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                
                {/* Premium Grid 2x2 Card buttons */}
                <div className="grid grid-cols-2 gap-4">
                  {/* EDIT CARD */}
                  <Link 
                    to={hasPlan && selectedCard ? `/editor?cardId=${selectedCard.id}` : '/pricing'}
                    className="relative bg-[#f5effc] border border-[#ebdff8] p-5 rounded-[24px] flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm relative">
                      <Pencil size={22} className="text-[#8b5cf6]" />
                      {/* Spark Icon */}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="absolute -top-1 -right-1 select-none pointer-events-none">
                        <line x1="2" y1="10" x2="2" y2="7" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="5" y1="10" x2="7" y2="5" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="8" y1="10" x2="11" y2="8" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-sm font-black text-gray-800 tracking-tight mt-3">Edit Card</span>
                    <span className="text-[11px] text-gray-500 font-medium mt-1 leading-snug">Update your card details</span>
                  </Link>

                  {/* VIEW CARD */}
                  <a 
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="relative bg-[#ebf8f2] border border-[#daf2e8] p-5 rounded-[24px] flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm relative">
                      <Eye size={22} className="text-[#10b981]" />
                      {/* Spark Icon */}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="absolute -top-1 -right-1 select-none pointer-events-none">
                        <line x1="2" y1="10" x2="2" y2="7" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="5" y1="10" x2="7" y2="5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="8" y1="10" x2="11" y2="8" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-sm font-black text-gray-800 tracking-tight mt-3">View Card</span>
                    <span className="text-[11px] text-gray-500 font-medium mt-1 leading-snug">Preview your card information</span>
                  </a>

                  {/* SHARE QR */}
                  <button 
                    onClick={() => setShowQR(true)}
                    className="relative bg-[#fff8e7] border border-[#fef0cd] p-5 rounded-[24px] flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm relative">
                      <QrCode size={22} className="text-[#f59e0b]" />
                      {/* Spark Icon */}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="absolute -top-1 -right-1 select-none pointer-events-none">
                        <line x1="2" y1="10" x2="2" y2="7" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="5" y1="10" x2="7" y2="5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="8" y1="10" x2="11" y2="8" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-sm font-black text-gray-800 tracking-tight mt-3">Share QR</span>
                    <span className="text-[11px] text-gray-500 font-medium mt-1 leading-snug">Share your card via QR code</span>
                  </button>

                  {/* COPY LINK */}
                  <button 
                    onClick={copyLink}
                    className="relative bg-[#edf6ff] border border-[#daecff] p-5 rounded-[24px] flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm relative">
                      {copied ? (
                        <Check size={22} className="text-emerald-500 animate-scale-in" />
                      ) : (
                        <>
                          <Copy size={22} className="text-[#3b82f6]" />
                          {/* Spark Icon */}
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="absolute -top-1 -right-1 select-none pointer-events-none">
                            <line x1="2" y1="10" x2="2" y2="7" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="5" y1="10" x2="7" y2="5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="8" y1="10" x2="11" y2="8" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </>
                      )}
                    </div>
                    <span className="text-sm font-black text-gray-800 tracking-tight mt-3">
                      {copied ? 'Copied!' : 'Copy Link'}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium mt-1 leading-snug">
                      {copied ? 'Link copied successfully' : 'Copy card link to clipboard'}
                    </span>
                  </button>
                </div>
              </div>


            </div>

          </div>

        </main>
      </div>

      {showQR && selectedCard && (
        <QRModal
          cardId={selectedCard.id}
          userName={selectedCard.name || user?.name}
          onClose={() => setShowQR(false)}
        />
      )}

      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity" onClick={() => !savingProfile && setShowEditProfile(false)} />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-50/50 animate-scale-in z-10 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
              <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span className="text-purple-600">👤</span> Edit User Profile
              </h3>
              <button 
                type="button"
                onClick={() => setShowEditProfile(false)} 
                disabled={savingProfile}
                className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-600 rounded-full transition-all disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error & Success Messages */}
            {profileError && (
              <div className="mb-4.5 p-3.5 bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm font-semibold rounded-2xl animate-shake">
                ⚠️ {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="mb-4.5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2 animate-bounce-short">
                ✨ Profile updated successfully!
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="space-y-5">
              
              {/* Profile Image Drag & Drop Area */}
              <div className="flex flex-col items-center gap-4.5 py-4 bg-[#fafafc] border border-dashed border-gray-200 rounded-3xl relative hover:border-[#7c3aed]/40 transition-colors group">
                <div className="relative">
                  {/* Spinning dotted lines around preview */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-purple-400/70 animate-[spin_25s_linear_infinite]" />
                  <div className="w-20 h-20 rounded-full bg-white p-0.5 relative z-10 flex items-center justify-center shadow-md">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 flex items-center justify-center text-indigo-600 font-extrabold text-3xl border border-white">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        profileName?.[0]?.toUpperCase() || 'V'
                      )}
                    </div>
                  </div>
                  
                  {/* Plus camera overlay badge */}
                  <label htmlFor="avatar-file" className="absolute bottom-0 right-0 w-6 h-6 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-full flex items-center justify-center text-white shadow-md border-2 border-white cursor-pointer z-20 hover:scale-110 active:scale-95 transition-all">
                    <span className="text-[11px] leading-none font-black">+</span>
                  </label>
                </div>
                
                <div className="text-center px-4">
                  <input 
                    type="file" 
                    id="avatar-file" 
                    accept="image/jpeg,image/png,image/gif,image/webp" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          setProfileError('File size exceeds the 5MB limit.')
                          return
                        }
                        setAvatarFile(file)
                        setAvatarPreview(URL.createObjectURL(file))
                        setProfileError('')
                      }
                    }}
                  />
                  <p className="text-xs font-bold text-gray-700">Drag & drop or click the button to upload</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">Supports PNG, JPG, GIF, WebP up to 5MB</p>
                </div>
              </div>

              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Vijay Kumar"
                  disabled={savingProfile || profileSuccess}
                  className="w-full px-4.5 py-3 rounded-2xl border border-gray-200 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 bg-white font-semibold text-sm outline-none transition-all placeholder:text-gray-300 disabled:opacity-65"
                />
              </div>

              {/* Email Address Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="e.g. vijay@smartcard.com"
                  disabled={savingProfile || profileSuccess}
                  className="w-full px-4.5 py-3 rounded-2xl border border-gray-200 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 bg-white font-semibold text-sm outline-none transition-all placeholder:text-gray-300 disabled:opacity-65"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  disabled={savingProfile || profileSuccess}
                  className="px-5 py-3 border border-gray-200 hover:bg-slate-50 text-gray-500 hover:text-gray-700 text-xs font-bold rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={savingProfile || profileSuccess}
                  className="px-6 py-3 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-75 text-white text-xs font-bold rounded-2xl shadow-md shadow-purple-100/60 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  {savingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving changes…
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}
