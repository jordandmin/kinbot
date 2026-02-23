import {
  Search,
  Users,
  Brain,
  ShieldCheck,
  ListTodo,
  MessageCircle,
  Clock,
  Puzzle,
  Image,
  Terminal,
  HardDrive,
  Plug,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { ToolDomain } from '@/shared/types'

/** Map domain icon names to Lucide components (client-side resolution) */
const DOMAIN_ICONS: Record<ToolDomain, React.FC<LucideProps>> = {
  search: Search,
  contacts: Users,
  memory: Brain,
  vault: ShieldCheck,
  tasks: ListTodo,
  'inter-kin': MessageCircle,
  crons: Clock,
  custom: Puzzle,
  images: Image,
  shell: Terminal,
  'file-storage': HardDrive,
  mcp: Plug,
}

interface ToolDomainIconProps extends LucideProps {
  domain: ToolDomain
}

/** Renders the Lucide icon for a tool domain. Reusable anywhere. */
export function ToolDomainIcon({ domain, ...props }: ToolDomainIconProps) {
  const Icon = DOMAIN_ICONS[domain]
  return <Icon {...props} />
}
