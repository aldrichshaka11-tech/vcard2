import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, FEATURES } from '../api/useAuth';

export default function FeatureGate({ feature, children, fallback = null }) {
  return <>{children}</>;
}

export { FEATURES };
