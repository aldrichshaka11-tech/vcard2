import { useEffect } from 'react'
import { Check, Sparkles } from 'lucide-react'
import templateMaroon from '../assets/template_maroon.png'
import templateBlue from '../assets/template_blue.png'
import templateOrange from '../assets/template_orange.png'
import templateTeal from '../assets/template_teal.png'

const TEMPLATE_PRESETS = [
  {
    id: 'maroon_elegance',
    name: 'Maroon Elegance',
    description: 'Geometric maroon/pink borders with circular yellow accent.',
    thumbnail: templateMaroon,
    priceSale: '₹ 199',
    priceOrig: '₹ 299',
    badge: 'Other',
    themeColor: '#9d174d',
    virtualBg: {
      enabled: true,
      preset: '',
      custom: 'template_maroon.png',
      fontColor: 'dark'
    },
    layout: {
      coverHeight: 160,
      overlap: 60,
      profileSize: 96,
      logoSize: 56,
      cardBgColor: '',
      cover: { zoom: 1.0, x: 50, y: 50 },
      profile: { zoom: 1.0, x: 50, y: 50 },
      logo: { zoom: 1.0, x: 50, y: 50 }
    }
  },
  {
    id: 'corporate_blue',
    name: 'Geometric Colorful',
    description: 'Energetic multicolor geometric shapes.',
    thumbnail: templateBlue,
    priceSale: '₹ 299',
    priceOrig: '₹ 499',
    badge: 'Common',
    themeColor: '#db2777',
    virtualBg: {
      enabled: true,
      preset: '',
      custom: 'template_blue.png',
      fontColor: 'dark'
    },
    layout: {
      coverHeight: 160,
      overlap: 55,
      profileSize: 96,
      logoSize: 56,
      cardBgColor: '',
      cover: { zoom: 1.0, x: 50, y: 50 },
      profile: { zoom: 1.0, x: 50, y: 50 },
      logo: { zoom: 1.0, x: 50, y: 50 }
    }
  },
  {
    id: 'sunset_gradient',
    name: 'Navy Orange',
    description: 'Dynamic navy blue and orange geometric theme.',
    thumbnail: templateOrange,
    priceSale: '₹ 299',
    priceOrig: '₹ 499',
    badge: 'Common',
    themeColor: '#ea580c',
    virtualBg: {
      enabled: true,
      preset: '',
      custom: 'template_orange.png',
      fontColor: 'dark'
    },
    layout: {
      coverHeight: 160,
      overlap: 55,
      profileSize: 96,
      logoSize: 56,
      cardBgColor: '',
      cover: { zoom: 1.0, x: 50, y: 50 },
      profile: { zoom: 1.0, x: 50, y: 50 },
      logo: { zoom: 1.0, x: 50, y: 50 }
    }
  },
  {
    id: 'modern_teal',
    name: 'Abstract Shapes',
    description: 'Vibrant pink, purple, and orange geometric elements.',
    thumbnail: templateTeal,
    priceSale: '₹ 299',
    priceOrig: '₹ 499',
    badge: 'Common',
    themeColor: '#ec4899',
    virtualBg: {
      enabled: true,
      preset: '',
      custom: 'template_teal.png',
      fontColor: 'dark'
    },
    layout: {
      coverHeight: 160,
      overlap: 55,
      profileSize: 96,
      logoSize: 56,
      cardBgColor: '',
      cover: { zoom: 1.0, x: 50, y: 50 },
      profile: { zoom: 1.0, x: 50, y: 50 },
      logo: { zoom: 1.0, x: 50, y: 50 }
    }
  }
]

export default function TemplatesPanel({ card, setAll }) {
  // Auto-apply pending template from Templates page
  useEffect(() => {
    const pending = localStorage.getItem('pending_template')
    if (pending) {
      try {
        const preset = JSON.parse(pending)
        setAll({
          ...card,
          themeColor: preset.themeColor,
          virtualBg: { ...card.virtualBg, ...preset.virtualBg },
          layout: { ...card.layout, ...preset.layout }
        })
      } catch {}
      localStorage.removeItem('pending_template')
    }
  }, [])
  const isTemplateApplied = (preset) => {
    if (preset.virtualBg.enabled !== card.virtualBg?.enabled) return false
    if (preset.virtualBg.custom && !card.virtualBg?.custom?.includes(preset.virtualBg.custom)) return false
    if (!preset.virtualBg.custom && preset.virtualBg.preset !== card.virtualBg?.preset) return false
    if (preset.themeColor !== card.themeColor) return false
    return true
  }

  const applyTemplate = (preset) => {
    const updatedCard = {
      ...card,
      themeColor: preset.themeColor,
      virtualBg: {
        ...card.virtualBg,
        ...preset.virtualBg
      },
      layout: {
        ...card.layout,
        ...preset.layout
      }
    }
    setAll(updatedCard)
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm hover:shadow-md transition-all space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-50">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-amber-400 fill-amber-400 animate-pulse" size={20} />
            Visual Templates
          </h2>
          <p className="text-xs text-slate-400 mt-1">Transform your digital business card instantly with curated layouts and styles.</p>
        </div>
        <span className="text-[10px] font-bold tracking-widest text-indigo-500 uppercase px-2.5 py-1 bg-indigo-50 rounded-full">
          PRESETS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
        {TEMPLATE_PRESETS.map((preset) => {
          const applied = isTemplateApplied(preset)
          
          return (
            <div
              key={preset.id}
              onClick={() => applyTemplate(preset)}
              className={`group flex flex-col rounded-3xl bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer ${
                applied 
                  ? 'border-2 border-green-600 scale-[1.02] shadow-lg' 
                  : 'border border-slate-100 hover:scale-[1.01] hover:border-slate-200'
              }`}
              style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}
            >
              {/* Full Image Area showing the full vertical card */}
              <div 
                className="w-full relative overflow-hidden bg-slate-50"
                style={{
                  height: '380px',
                  backgroundImage: `url(${preset.thumbnail})`,
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center'
                }}
              >
                {applied && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg animate-scale-in z-10 border-2 border-white">
                    <Check size={16} strokeWidth={3.5} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
