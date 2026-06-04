import { useState, useEffect } from 'react'
import { X, Check, Loader, Tag, Zap, Crown, Rocket, CreditCard } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../api/useAuth'

const PLANS = [
  {
    id: 'basic', name: 'Basic Plan', price: 299, label: '/month',
    icon: <Zap size={22} />, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200',
    features: [
      '1 Digital Business Card',
      'Profile Photo upload',
      'Up to 5 Social Links',
      '7-day Analytics tracking',
      'Save, Copy & Export card'
    ],
  },
  {
    id: 'pro', name: 'Pro Plan', price: 599, label: '/month',
    icon: <Crown size={22} />, color: 'text-indigo-600', bg: 'bg-indigo-50',
    border: 'border-indigo-400', popular: true,
    features: [
      'Unlimited Links & QR sharing',
      'Cover & Logo Photo upload',
      'Custom Theme Colors',
      'Lead Capture & Management',
      'Save, Copy & Export card'
    ],
  },
  {
    id: 'advanced', name: 'Advanced Plan', price: 999, label: '/month',
    icon: <Rocket size={22} />, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-400',
    features: [
      'Everything in Pro Plan',
      'Virtual Custom Backgrounds',
      'CSV Export for Leads',
      'Custom URL Slug branding',
      'Full Analytics History'
    ],
  },
]

export default function BillingModal({ onClose }) {
  const { user, refreshUser } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState('basic')
  const [paying, setPaying] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [couponResult, setCouponResult] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const activePlanDetails = PLANS.find(p => p.id === selectedPlan)

  const validateCoupon = async () => {
    if (!coupon.trim()) return
    setCouponLoading(true)
    try {
      const res = await api.post('/pay/validate-coupon', { code: coupon.trim(), plan: selectedPlan })
      setCouponResult(res.data)
    } catch (err) {
      setCouponResult({ error: err.response?.data?.error || 'Invalid coupon' })
    } finally {
      setCouponLoading(false)
    }
  }

  const handlePay = async () => {
    setPaying(true)
    try {
      const body = { plan: selectedPlan }
      if (coupon.trim() && couponResult?.valid) {
        body.coupon = coupon.trim()
      }
      const res = await api.post('/pay/initiate', body)
      if (res.data.free) {
        // 100% coupon discount — already activated
        await refreshUser()
        window.location.reload()
      } else {
        // Redirect to PhonePe
        const link = document.createElement('a')
        link.href = res.data.redirect_url
        link.rel = 'noreferrer'
        document.body.appendChild(link)
        link.click()
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Payment initiation failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  const getDisplayPrice = (plan) => {
    if (couponResult?.valid && !couponResult.error) {
      return Math.round(couponResult.final_amount / 100)
    }
    return plan.price
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 transform transition-all flex flex-col md:flex-row max-h-[90vh] animate-scale-in">
        
        {/* Left pane: Plans Selection */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Choose Premium Plan</h3>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-6">Unlock saving, sharing, and custom card downloads instantly.</p>

            <div className="space-y-4">
              {PLANS.map((plan) => {
                const isSelected = plan.id === selectedPlan
                return (
                  <div
                    key={plan.id}
                    onClick={() => { setSelectedPlan(plan.id); setCouponResult(null); }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-white shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${plan.bg} ${plan.color}`}>
                          {plan.icon}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{plan.name}</p>
                          {plan.popular && <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Best Value</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">₹</span>
                        <span className="text-lg font-bold text-slate-800">{plan.price}</span>
                        <span className="text-[10px] text-slate-400">{plan.label}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 hidden md:block">
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <CreditCard size={12} /> Secure PhonePe checkout integration
            </p>
          </div>
        </div>

        {/* Right pane: Checkout and Feature highlights */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between relative bg-white">
          <button
            onClick={onClose}
            className="hidden md:flex absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <X size={18} />
          </button>

          <div>
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Included Features</h4>
            <ul className="space-y-2 mb-6">
              {activePlanDetails?.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Coupon Code section */}
            <div className="mb-6 pt-4 border-t border-slate-100">
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Discount Coupon</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ENTER COUPON"
                    value={coupon}
                    onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponResult(null) }}
                    className="w-full pl-8 pr-2 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono uppercase"
                  />
                </div>
                <button
                  onClick={validateCoupon}
                  disabled={couponLoading || !coupon.trim()}
                  className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors border border-slate-200"
                >
                  {couponLoading ? <Loader size={12} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
              {couponResult && (
                <p className={`text-xs mt-1.5 font-semibold ${couponResult.error ? 'text-red-500' : 'text-green-600'}`}>
                  {couponResult.error || `✓ Saved ₹${Math.round(couponResult.discount_amount / 100)}!`}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-700">Total Price:</span>
              <div className="text-right">
                {couponResult?.valid && !couponResult.error && (
                  <span className="text-xs text-slate-400 line-through mr-1.5">₹{activePlanDetails.price}</span>
                )}
                <span className="text-xl font-black text-slate-900">₹{getDisplayPrice(activePlanDetails)}</span>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {paying ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  <span>Pay Now & Activate</span>
                </>
              )}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  )
}
