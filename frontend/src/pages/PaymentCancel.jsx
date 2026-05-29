import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { XCircle, ArrowRight, Home, HelpCircle, Phone } from 'lucide-react'
import api from '../api/axios'

export default function PaymentCancel() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id') || ''

  useEffect(() => {
    if (orderId) {
      api.post('/pay/cancel-order', { order_id: orderId })
        .catch(err => console.error('Failed to notify backend of cancellation:', err))
    }
  }, [orderId])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-rose-50 via-white to-gray-50"
      style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}
    >
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
          <span className="text-white text-xs font-bold">K</span>
        </div>
        <span className="font-black text-xl text-gray-800 tracking-tight">KairavCard</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <XCircle size={44} className="text-white" />
          </div>
          <h1 className="text-2xl font-black mb-1">Payment Cancelled</h1>
          <p className="text-white/85 text-sm">You cancelled the payment or it was not completed.</p>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5">
          {/* Info card */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-2">
            <p className="text-sm text-red-800 font-semibold flex items-center gap-1.5">
              <XCircle size={15} className="text-red-500" />
              No charge was made to your account
            </p>
            <p className="text-xs text-red-600">
              If you see a deduction in your bank account, it will be automatically refunded within 5–7 business days.
            </p>
          </div>

          {orderId && (
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">Reference ID</p>
              <p className="text-xs font-mono text-gray-600 break-all">{orderId}</p>
            </div>
          )}

          {/* Reasons */}
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Why might this happen?</p>
            <div className="space-y-2">
              {[
                'You pressed the Back or Cancel button during payment',
                'Your internet connection dropped mid-payment',
                'Your bank declined the transaction',
                'Payment session timed out',
              ].map((reason, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[9px] text-gray-500 font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-600">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#c14f3e] to-[#e06b5a] hover:from-[#a63d2f] hover:to-[#c14f3e] text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Try Again <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-2xl text-sm transition-all border border-gray-200"
            >
              <Home size={15} /> Back to Dashboard
            </button>
          </div>

          {/* Support */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 text-center mb-3 flex items-center justify-center gap-1">
              <HelpCircle size={12} /> Need help?
            </p>
            <div className="flex justify-center gap-4">
              <a href="mailto:support@kairavcard.com" className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline transition-colors">
                support@kairavcard.com
              </a>
              <span className="text-gray-200">|</span>
              <a href="tel:+91-XXXXXXXXXX" className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline transition-colors flex items-center gap-1">
                <Phone size={10} /> Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
