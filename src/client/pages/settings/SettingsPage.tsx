import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/client/components/ui/sidebar'
import { ProvidersSettings } from '@/client/pages/settings/ProvidersSettings'
import { SearchProvidersSettings } from '@/client/pages/settings/SearchProvidersSettings'
import { VaultSettings } from '@/client/pages/settings/VaultSettings'
import { McpServersSettings } from '@/client/pages/settings/McpServersSettings'
import { ContactsSettings } from '@/client/pages/settings/ContactsSettings'
import { FileStorageSettings } from '@/client/pages/settings/FileStorageSettings'
import {
  BrainCircuit,
  Search,
  Puzzle,
  Lock,
  Users,
  FolderOpen,
} from 'lucide-react'

const sections = [
  { id: 'providers', icon: BrainCircuit, labelKey: 'settings.providers.title' },
  { id: 'search', icon: Search, labelKey: 'settings.searchProviders.title' },
  { id: 'mcp', icon: Puzzle, labelKey: 'settings.mcp.title' },
  { id: 'vault', icon: Lock, labelKey: 'settings.vault.title' },
  { id: 'contacts', icon: Users, labelKey: 'settings.contacts.title' },
  { id: 'files', icon: FolderOpen, labelKey: 'settings.files.title' },
] as const

type SectionId = (typeof sections)[number]['id']

const sectionComponents: Record<SectionId, React.FC> = {
  providers: ProvidersSettings,
  search: SearchProvidersSettings,
  mcp: McpServersSettings,
  vault: VaultSettings,
  contacts: ContactsSettings,
  files: FileStorageSettings,
}

export function SettingsPage() {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState<SectionId>('providers')

  const ActiveComponent = sectionComponents[activeSection]

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Settings sidebar */}
      <nav className="w-56 shrink-0 border-r surface-sidebar overflow-y-auto py-4 px-3">
        <SidebarMenu>
          {sections.map(({ id, icon: Icon, labelKey }) => (
            <SidebarMenuItem key={id}>
              <SidebarMenuButton
                onClick={() => setActiveSection(id)}
                isActive={activeSection === id}
                tooltip={t(labelKey)}
              >
                <Icon className="size-4" />
                <span>{t(labelKey)}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </nav>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}
