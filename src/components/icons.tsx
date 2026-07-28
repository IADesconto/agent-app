import React from 'react';
import {
  Bot,
  Sparkles,
  Code,
  Globe,
  Wallet,
  TrendingUp,
  Calculator,
  Megaphone,
  BarChart3,
  Headphones,
  Scale,
  Users,
  FileText,
  MessageSquare,
  Zap,
  Crown,
  Star,
  User,
  Home,
  Settings,
  Menu,
  Plus,
  X,
  Check,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Send,
  LogOut,
  Trash2,
  Shield,
  ShieldCheck,
  Key,
  CreditCard,
  Terminal,
  DollarSign,
  Activity,
  BrainCircuit,
  Cpu,
  Code2,
  Braces,
  Server,
  Cloud,
  Database,
  QrCode,
  Banknote,
  Gift,
  Clock,
  Paperclip,
  Search,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Info,
  AlertCircle,
  Copy,
  ExternalLink,
  Filter,
  Minus,
  MoreHorizontal,
  Maximize2,
  RefreshCw,
  SlidersHorizontal,
  Wrench,
  Smartphone,
  Fingerprint,
  MapPin,
  ChartLine,
} from 'lucide-react-native';
import { colors } from '../theme';

type IconProps = { size?: number; color?: string };

const s = 20;
const c = colors.foreground;

// === Core ===
export function BotIcon(p: IconProps) { return <Bot size={p.size || s} color={p.color || c} />; }
export function SparklesIcon(p: IconProps) { return <Sparkles size={p.size || s} color={p.color || colors.primary} />; }
export function CodeIcon(p: IconProps) { return <Code size={p.size || s} color={p.color || c} />; }
export function GlobeIcon(p: IconProps) { return <Globe size={p.size || s} color={p.color || c} />; }
export function WalletIcon(p: IconProps) { return <Wallet size={p.size || s} color={p.color || c} />; }
export function TrendingUpIcon(p: IconProps) { return <TrendingUp size={p.size || s} color={p.color || c} />; }
export function CalculatorIcon(p: IconProps) { return <Calculator size={p.size || s} color={p.color || c} />; }
export function MegaphoneIcon(p: IconProps) { return <Megaphone size={p.size || s} color={p.color || c} />; }
export function BarChart3Icon(p: IconProps) { return <BarChart3 size={p.size || s} color={p.color || c} />; }
export function HeadphonesIcon(p: IconProps) { return <Headphones size={p.size || s} color={p.color || c} />; }
export function ScaleIcon(p: IconProps) { return <Scale size={p.size || s} color={p.color || c} />; }
export function UsersIcon(p: IconProps) { return <Users size={p.size || s} color={p.color || c} />; }
export function FileTextIcon(p: IconProps) { return <FileText size={p.size || s} color={p.color || c} />; }
export function MessageSquareIcon(p: IconProps) { return <MessageSquare size={p.size || s} color={p.color || c} />; }

// === Ações ===
export function ZapIcon(p: IconProps) { return <Zap size={p.size || s} color={p.color || colors.primary} />; }
export function CrownIcon(p: IconProps) { return <Crown size={p.size || s} color={p.color || colors.warning} />; }
export function StarIcon(p: IconProps) { return <Star size={p.size || s} color={p.color || colors.warning} />; }
export function UserIcon(p: IconProps) { return <User size={p.size || s} color={p.color || c} />; }
export function HomeIcon(p: IconProps) { return <Home size={p.size || s} color={p.color || c} />; }
export function SettingsIcon(p: IconProps) { return <Settings size={p.size || s} color={p.color || c} />; }
export function MenuIcon(p: IconProps) { return <Menu size={p.size || s} color={p.color || c} />; }
export function PlusIcon(p: IconProps) { return <Plus size={p.size || s} color={p.color || c} />; }
export function MinusIcon(p: IconProps) { return <Minus size={p.size || s} color={p.color || c} />; }
export function XIcon(p: IconProps) { return <X size={p.size || s} color={p.color || c} />; }
export function CheckIcon(p: IconProps) { return <Check size={p.size || s} color={p.color || c} />; }
export function CheckCircleIcon(p: IconProps) { return <CheckCircle size={p.size || s} color={p.color || colors.primary} />; }
export function ChevronRightIcon(p: IconProps) { return <ChevronRight size={p.size || s} color={p.color || c} />; }
export function ChevronDownIcon(p: IconProps) { return <ChevronDown size={p.size || s} color={p.color || c} />; }
export function ChevronUpIcon(p: IconProps) { return <ChevronUp size={p.size || s} color={p.color || c} />; }
export function ArrowLeftIcon(p: IconProps) { return <ArrowLeft size={p.size || s} color={p.color || c} />; }
export function ArrowRightIcon(p: IconProps) { return <ArrowRight size={p.size || s} color={p.color || c} />; }
export function ArrowUpIcon(p: IconProps) { return <ArrowUp size={p.size || s} color={p.color || c} />; }
export function ArrowUpRightIcon(p: IconProps) { return <ArrowUpRight size={p.size || s} color={p.color || c} />; }
export function SendIcon(p: IconProps) { return <Send size={p.size || s} color={p.color || colors.primary} />; }
export function LogOutIcon(p: IconProps) { return <LogOut size={p.size || s} color={p.color || c} />; }
export function TrashIcon(p: IconProps) { return <Trash2 size={p.size || s} color={p.color || c} />; }
export function CopyIcon(p: IconProps) { return <Copy size={p.size || s} color={p.color || c} />; }
export function ExternalLinkIcon(p: IconProps) { return <ExternalLink size={p.size || s} color={p.color || c} />; }
export function MoreHorizontalIcon(p: IconProps) { return <MoreHorizontal size={p.size || s} color={p.color || c} />; }
export function Maximize2Icon(p: IconProps) { return <Maximize2 size={p.size || s} color={p.color || c} />; }
export function RefreshCwIcon(p: IconProps) { return <RefreshCw size={p.size || s} color={p.color || c} />; }
export function FilterIcon(p: IconProps) { return <Filter size={p.size || s} color={p.color || c} />; }
export function SearchIcon(p: IconProps) { return <Search size={p.size || s} color={p.color || c} />; }
export function PaperclipIcon(p: IconProps) { return <Paperclip size={p.size || s} color={p.color || c} />; }

// === Auth ===
export function MailIcon(p: IconProps) { return <Mail size={p.size || s} color={p.color || c} />; }
export function LockIcon(p: IconProps) { return <Lock size={p.size || s} color={p.color || c} />; }
export function EyeIcon(p: IconProps) { return <Eye size={p.size || s} color={p.color || c} />; }
export function EyeOffIcon(p: IconProps) { return <EyeOff size={p.size || s} color={p.color || c} />; }
export function ShieldIcon(p: IconProps) { return <Shield size={p.size || s} color={p.color || c} />; }
export function ShieldCheckIcon(p: IconProps) { return <ShieldCheck size={p.size || s} color={p.color || c} />; }
export function KeyIcon(p: IconProps) { return <Key size={p.size || s} color={p.color || c} />; }
export function FingerprintIcon(p: IconProps) { return <Fingerprint size={p.size || s} color={p.color || c} />; }

// === Finance ===
export function CreditCardIcon(p: IconProps) { return <CreditCard size={p.size || s} color={p.color || c} />; }
export function DollarSignIcon(p: IconProps) { return <DollarSign size={p.size || s} color={p.color || c} />; }
export function BanknoteIcon(p: IconProps) { return <Banknote size={p.size || s} color={p.color || c} />; }
export function QrCodeIcon(p: IconProps) { return <QrCode size={p.size || s} color={p.color || c} />; }
export function GiftIcon(p: IconProps) { return <Gift size={p.size || s} color={p.color || c} />; }
export function ClockIcon(p: IconProps) { return <Clock size={p.size || s} color={p.color || c} />; }
export function ChartLineIcon(p: IconProps) { return <ChartLine size={p.size || s} color={p.color || c} />; }

// === Tech / Dev ===
export function TerminalIcon(p: IconProps) { return <Terminal size={p.size || s} color={p.color || c} />; }
export function BrainCircuitIcon(p: IconProps) { return <BrainCircuit size={p.size || s} color={p.color || c} />; }
export function CpuIcon(p: IconProps) { return <Cpu size={p.size || s} color={p.color || c} />; }
export function Code2Icon(p: IconProps) { return <Code2 size={p.size || s} color={p.color || c} />; }
export function BracesIcon(p: IconProps) { return <Braces size={p.size || s} color={p.color || c} />; }
export function ServerIcon(p: IconProps) { return <Server size={p.size || s} color={p.color || c} />; }
export function CloudIcon(p: IconProps) { return <Cloud size={p.size || s} color={p.color || c} />; }
export function DatabaseIcon(p: IconProps) { return <Database size={p.size || s} color={p.color || c} />; }
export function SlidersHorizontalIcon(p: IconProps) { return <SlidersHorizontal size={p.size || s} color={p.color || c} />; }
export function WrenchIcon(p: IconProps) { return <Wrench size={p.size || s} color={p.color || c} />; }

// === Info ===
export function InfoIcon(p: IconProps) { return <Info size={p.size || s} color={p.color || c} />; }
export function AlertCircleIcon(p: IconProps) { return <AlertCircle size={p.size || s} color={p.color || c} />; }
export function ActivityIcon(p: IconProps) { return <Activity size={p.size || s} color={p.color || c} />; }
export function SmartphoneIcon(p: IconProps) { return <Smartphone size={p.size || s} color={p.color || c} />; }
export function MapPinIcon(p: IconProps) { return <MapPin size={p.size || s} color={p.color || c} />; }

// Agent -> icon component (lucide)
export function getAgentIconComponent(name: string, size = 22): React.ReactElement {
  const n = name.toLowerCase();
  if (n.includes('financeiro')) return <Wallet size={size} color={colors.primary} />;
  if (n.includes('contab')) return <Calculator size={size} color={colors.primary} />;
  if (n.includes('venda')) return <TrendingUp size={size} color={colors.primary} />;
  if (n.includes('suporte')) return <Headphones size={size} color={colors.primary} />;
  if (n.includes('dev') || n.includes('desenvolv')) return <Code size={size} color={colors.primary} />;
  if (n.includes('marketing')) return <Megaphone size={size} color={colors.primary} />;
  if (n.includes('dado')) return <BarChart3 size={size} color={colors.primary} />;
  if (n.includes('navegador') || n.includes('web')) return <Globe size={size} color={colors.primary} />;
  if (n.includes('juridico')) return <Scale size={size} color={colors.primary} />;
  if (n.includes('rh')) return <Users size={size} color={colors.primary} />;
  if (n.includes('whatsapp')) return <MessageSquare size={size} color={colors.primary} />;
  return <Bot size={size} color={colors.primary} />;
}

// Template -> icon component (lucide)
export function getTemplateIcon(id: string, size = 24): React.ReactElement {
  const map: Record<string, React.ReactElement> = {
    'assistente-financeiro': <Wallet size={size} color={colors.primary} />,
    'assistente-dev': <Code size={size} color={colors.primary} />,
    'assistente-dados': <BarChart3 size={size} color={colors.primary} />,
    'assistente-marketing': <Megaphone size={size} color={colors.primary} />,
    'navegador-web': <Globe size={size} color={colors.primary} />,
    'whatsapp-bot': <MessageSquare size={size} color={colors.primary} />,
  };
  return map[id] || <Bot size={size} color={colors.primary} />;
}
