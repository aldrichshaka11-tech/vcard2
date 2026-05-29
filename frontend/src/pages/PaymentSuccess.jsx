import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, ArrowRight, RefreshCw, Home, LayoutDashboard } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../api/useAuth'

// Simple confetti burst
function Confetti({ active }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      r: Math.random() * 6 + 4,
      color: ['#c14f3e','#10b981','#6366f1','#f59e0b','#ec4899','#06b6d4'][Math.floor(Math.random()*6)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 5,
    }))
    let frame
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.angle += p.spin
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.angle * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.5)
        ctx.restore()
      })
      frame = requestAnimationFrame(animate)
    }
    animate()
    const timer = setTimeout(() => cancelAnimationFrame(frame), 4000)
    return () => { cancelAnimationFrame(frame); clearTimeout(timer) }
  }, [active])
  if (!active) return null
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | success | failed | pending
  const [plan, setPlan] = useState('')
  const [planRole, setPlanRole] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(8)
  const orderId = searchParams.get('order_id')
  const { refreshUser } = useAuth()

  const refreshUserAndRedirect = async () => {
    try {
      // Call refreshUser from our context which handles fetching and saving token & user details
      await refreshUser()
    } catch (e) {
      // Non-fatal — if /me fails we still show success
      console.warn('Could not refresh user after payment:', e)
    }
  }

  useEffect(() => {
    if (!orderId) {
      navigate('/pricing')
      return
    }

    // PhonePe may pass a failure code in query string
    const urlCode = searchParams.get('code') || searchParams.get('state') || ''
    if (['PAYMENT_CANCELLED', 'PAYMENT_ERROR', 'FAILED'].includes(urlCode.toUpperCase())) {
      setStatus('failed')
      api.post('/pay/cancel-order', { order_id: orderId })
        .catch(err => console.error('Failed to notify backend of failure/cancellation:', err))
      return
    }

    const check = async (attempt = 0) => {
      try {
        const res = await api.get(`/pay/status?order_id=${orderId}`)
        const payment = res.data.payment

        if (payment.status === 'success') {
          setPlan(payment.plan)
          setPlanRole(payment.plan)
          setStatus('success')
          // Refresh user data in localStorage so JWT stays valid — NO LOGOUT
          await refreshUserAndRedirect()
        } else if (payment.status === 'failed') {
          setStatus('failed')
        } else if (attempt < 8) {
          // Still pending — poll every 2.5 seconds (up to 20 seconds total)
          setAttemptsLeft(8 - attempt - 1)
          setTimeout(() => check(attempt + 1), 2500)
        } else {
          // After 20 seconds still pending
          setStatus('pending')
        }
      } catch (err) {
        if (err.response?.status === 401) {
          // Token expired — but this is payment page, don't redirect to login
          // Try to re-check without auth (status endpoint returns public info too)
          setStatus('pending')
        } else {
          setStatus('failed')
        }
      }
    }

    check()
  }, [orderId])

  const planLabel = planRole === 'advanced' ? 'Advanced' : planRole === 'pro' ? 'Pro' : plan
  const planColor = planRole === 'advanced' ? 'from-violet-500 to-purple-600' : planRole === 'pro' ? 'from-indigo-500 to-blue-600' : 'from-gray-500 to-gray-600'
  const planBadge = planRole === 'advanced' ? 'bg-violet-100 text-violet-700' : planRole === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 px-4"
         style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}>

      <Confetti active={status === 'success'} />

      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
          <span className="text-white text-xs font-bold">K</span>
        </div>
        <span className="font-black text-xl text-gray-800 tracking-tight">KairavCard</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">

        {/* ── Loading ── */}
        {status === 'loading' && (
          <div className="p-12 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw size={24} className="text-indigo-400 animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Your Payment</h2>
            <p className="text-gray-500 text-sm mb-4">Please wait — do not close or refresh this page.</p>
            <div className="flex justify-center gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i >= 8 - attemptsLeft ? 'bg-indigo-200' : 'bg-indigo-500'}`} />
              ))}
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {status === 'success' && (
          <>
            <div className={`bg-gradient-to-r ${planColor} p-8 text-center text-white`}>
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-black mb-1">Payment Successful! 🎉</h1>
              <p className="text-white/85 text-sm">Your plan has been activated</p>
            </div>
            <div className="p-8 space-y-5">
              <div className="text-center">
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${planBadge}`}>
                  {planLabel?.toUpperCase()} PLAN
                </span>
                <p className="text-gray-500 text-sm mt-3">
                  Your <strong className="text-gray-800 capitalize">{planLabel}</strong> plan is now active.
                  You can create and edit your digital business cards.
                </p>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-0.5">What's next?</p>
                  <p className="text-green-600">Go to your dashboard to create or edit your digital business card.</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#c14f3e] to-[#e06b5a] hover:from-[#a63d2f] hover:to-[#c14f3e] text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Go to Dashboard <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* ── Failed / Cancelled ── */}
        {status === 'failed' && (
          <>
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <XCircle size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-black mb-1">Payment Cancelled</h1>
              <p className="text-white/85 text-sm">Your payment was not completed</p>
            </div>
            <div className="p-8 space-y-4">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                <p className="text-sm text-red-700 font-medium">No amount has been charged from your account.</p>
                <p className="text-xs text-red-500 mt-1">If money was deducted, it will be refunded within 5–7 business days.</p>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-md"
              >
                Try Again <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Home size={15} /> Back to Dashboard
              </button>
            </div>
          </>
        )}

        {/* ── Pending (still processing) ── */}
        {status === 'pending' && (
          <>
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-8 text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-black mb-1">Payment Processing</h1>
              <p className="text-white/85 text-sm">Your payment is being verified</p>
            </div>
            <div className="p-8 space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-sm text-amber-800 font-medium mb-1">⏳ Taking longer than usual</p>
                <p className="text-xs text-amber-600">
                  Your payment is still being processed by the bank. 
                  <strong> Do not pay again.</strong> Your plan will activate automatically once confirmed.
                </p>
              </div>
              <p className="text-xs text-gray-400 text-center">Check your dashboard in a few minutes — your plan will appear there once activated.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl transition-all shadow-md"
              >
                <LayoutDashboard size={16} /> Go to Dashboard
              </button>
              <button
                onClick={() => { setStatus('loading'); setAttemptsLeft(8); window.location.reload() }}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <RefreshCw size={14} /> Refresh Status
              </button>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        Need help? Email us at <a href="mailto:support@kairavcard.com" className="text-indigo-500 hover:underline">support@kairavcard.com</a>
      </p>
    </div>
  )
}
