import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  Database,
  Eye,
  FileText,
  Globe,
  Heart,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Scale,
  Send,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { IconValue } from "./section-types";

export const iconMap: Record<string, LucideIcon> = {
  arrowRight: ArrowRight,
  award: Award,
  barChart: BarChart3,
  bell: Bell,
  bookOpen: BookOpen,
  building: Building2,
  calendar: Calendar,
  calendarDays: CalendarDays,
  checkCircle: CheckCircle,
  clock: Clock,
  database: Database,
  eye: Eye,
  fileText: FileText,
  globe: Globe,
  heart: Heart,
  lock: Lock,
  mail: Mail,
  mapPin: MapPin,
  messageSquare: MessageSquare,
  phone: Phone,
  scale: Scale,
  send: Send,
  shield: Shield,
  sparkles: Sparkles,
  target: Target,
  trendingUp: TrendingUp,
  users: Users,
  video: Video,
  wallet: Wallet,
  zap: Zap,
};

export function resolveIcon(icon: IconValue | undefined): LucideIcon | undefined {
  if (!icon) {
    return undefined;
  }

  if (typeof icon === "string") {
    return iconMap[icon];
  }

  return icon;
}
