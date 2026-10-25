import {
  Briefcase, Building2, CalendarDays, ClipboardList, HardHat, KeyRound, Layers, Lightbulb, MapPin, MapPinned,
  PaintRoller, PencilRuler, Settings, ShieldCheck, Sofa, Store, Timer, Truck, UserCheck, Wallet, Workflow,
  Users, Award, BarChart3, Clock, Hammer, Ruler, Sparkles, Star, Target, Wrench, Zap, Home, Package,
  type LucideIcon,
} from 'lucide-react'

export const ICONS: Record<string, LucideIcon> = {
  Briefcase, Building2, CalendarDays, ClipboardList, HardHat, KeyRound, Layers, Lightbulb, MapPin, MapPinned,
  PaintRoller, PencilRuler, Settings, ShieldCheck, Sofa, Store, Timer, Truck, UserCheck, Wallet, Workflow,
  Users, Award, BarChart3, Clock, Hammer, Ruler, Sparkles, Star, Target, Wrench, Zap, Home, Package,
}
export const ICON_NAMES = Object.keys(ICONS)

export function Icon({ name, className, size = 22 }: { name?: string; className?: string; size?: number }) {
  const C = (name && ICONS[name]) || Sparkles
  return <C className={className} size={size} aria-hidden="true" />
}
