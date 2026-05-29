import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, FEATURES } from '../api/useAuth';

export default function FeatureGate({ feature, children, fallback = null }) {
  const navigate = useNavigate();
  const { canAccessFeature, isPremium, isPending } = useAuth();

  if (canAccessFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative min-h-[160px] rounded-lg border border-transparent">
      <div className="pointer-events-none opacity-40 blur-[2px] h-full">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50/90 to-indigo-50/90 backdrop-blur-sm rounded-lg border-2 border-purple-200 p-2 overflow-hidden">
        <div className="text-center p-2 flex flex-col items-center justify-center h-full">
          <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-1 sm:mb-2 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">Premium Feature</p>
          <p className="text-[10px] sm:text-xs text-gray-600 mb-2 sm:mb-3">Upgrade to unlock</p>
          {isPending() ? (
            <div className="text-[10px] sm:text-xs text-orange-600 font-medium">
              Request pending
            </div>
          ) : (
            <button
              onClick={() => navigate('/pricing')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] sm:text-xs font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex-shrink-0"
            >
              Upgrade Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { FEATURES };
