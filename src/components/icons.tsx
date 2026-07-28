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
  ArrowLeft,
  Send,
  LogOut,
  Trash2,
  Shield,
  Key,
  CreditCard,
  Terminal,
  DollarSign,
  Activity,
} from 'lucide-react-native';
import { colors } from '../theme';

type IconProps = { size?: number; color?: string };

const s = 20;
const c = colors.text;

export function BotIcon(p: IconProps) { return <Bot size={p.size || s} color={p.color || c} />; }
export function SparklesIcon(p: IconProps) { return <Sparkles size={p.size || s} color={p.color || colors.accent} />; }
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
export function ZapIcon(p: IconProps) { return <Zap size={p.size || s} color={p.color || colors.accent} />; }
export function CrownIcon(p: IconProps) { return <Crown size={p.size || s} color={p.color || colors.warning} />; }
export function StarIcon(p: IconProps) { return <Star size={p.size || s} color={p.color || colors.warning} />; }
export function UserIcon(p: IconProps) { return <User size={p.size || s} color={p.color || c} />; }
export function HomeIcon(p: IconProps) { return <Home size={p.size || s} color={p.color || c} />; }
export function SettingsIcon(p: IconProps) { return <Settings size={p.size || s} color={p.color || c} />; }
export function MenuIcon(p: IconProps) { return <Menu size={p.size || s} color={p.color || c} />; }
export function PlusIcon(p: IconProps) { return <Plus size={p.size || s} color={p.color || c} />; }
export function XIcon(p: IconProps) { return <X size={p.size || s} color={p.color || c} />; }
export function CheckIcon(p: IconProps) { return <Check size={p.size || s} color={p.color || c} />; }
export function CheckCircleIcon(p: IconProps) { return <CheckCircle size={p.size || s} color={p.color || colors.accent} />; }
export function ChevronRightIcon(p: IconProps) { return <ChevronRight size={p.size || s} color={p.color || c} />; }
export function ArrowLeftIcon(p: IconProps) { return <ArrowLeft size={p.size || s} color={p.color || c} />; }
export function SendIcon(p: IconProps) { return <Send size={p.size || s} color={p.color || colors.accent} />; }
export function LogOutIcon(p: IconProps) { return <LogOut size={p.size || s} color={p.color || c} />; }
export function TrashIcon(p: IconProps) { return <Trash2 size={p.size || s} color={p.color || c} />; }
export function ShieldIcon(p: IconProps) { return <Shield size={p.size || s} color={p.color || c} />; }
export function KeyIcon(p: IconProps) { return <Key size={p.size || s} color={p.color || c} />; }
export function CreditCardIcon(p: IconProps) { return <CreditCard size={p.size || s} color={p.color || c} />; }
export function TerminalIcon(p: IconProps) { return <Terminal size={p.size || s} color={p.color || c} />; }
export function DollarSignIcon(p: IconProps) { return <DollarSign size={p.size || s} color={p.color || c} />; }
export function ActivityIcon(p: IconProps) { return <Activity size={p.size || s} color={p.color || c} />; }

// Agent -> icon component (lucide)
export function getAgentIconComponent(name: string, size = 22): React.ReactElement {
  const n = name.toLowerCase();
  if (n.includes('financeiro')) return <Wallet size={size} color={colors.accent} />;
  if (n.includes('contab')) return <Calculator size={size} color={colors.accent} />;
  if (n.includes('venda')) return <TrendingUp size={size} color={colors.accent} />;
  if (n.includes('suporte')) return <Headphones size={size} color={colors.accent} />;
  if (n.includes('dev') || n.includes('desenvolv')) return <Code size={size} color={colors.accent} />;
  if (n.includes('marketing')) return <Megaphone size={size} color={colors.accent} />;
  if (n.includes('dado')) return <BarChart3 size={size} color={colors.accent} />;
  if (n.includes('navegador') || n.includes('web')) return <Globe size={size} color={colors.accent} />;
  if (n.includes('juridico')) return <Scale size={size} color={colors.accent} />;
  if (n.includes('rh')) return <Users size={size} color={colors.accent} />;
  if (n.includes('whatsapp')) return <MessageSquare size={size} color={colors.accent} />;
  return <Bot size={size} color={colors.accent} />;
}

// Template -> icon component (lucide)
export function getTemplateIcon(id: string, size = 24): React.ReactElement {
  const map: Record<string, React.ReactElement> = {
    'assistente-financeiro': <Wallet size={size} color={colors.accent} />,
    'assistente-dev': <Code size={size} color={colors.accent} />,
    'assistente-dados': <BarChart3 size={size} color={colors.accent} />,
    'assistente-marketing': <Megaphone size={size} color={colors.accent} />,
    'navegador-web': <Globe size={size} color={colors.accent} />,
    'whatsapp-bot': <MessageSquare size={size} color={colors.accent} />,
  };
  return map[id] || <Bot size={size} color={colors.accent} />;
}
