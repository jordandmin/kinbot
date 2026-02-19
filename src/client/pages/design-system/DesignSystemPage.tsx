import { useState } from 'react'
import {
  Sun,
  Moon,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Bell,
  Search,
  Send,
  Settings,
  User,
  Bot,
  Clock,
  Loader2,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Trash2,
  Copy,
  Pencil,
} from 'lucide-react'

import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Textarea } from '@/client/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/client/components/ui/card'
import { Badge } from '@/client/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/client/components/ui/alert'
import { Checkbox } from '@/client/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/client/components/ui/radio-group'
import { Switch } from '@/client/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/client/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/client/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/client/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/client/components/ui/tooltip'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/client/components/ui/avatar'
import { Label } from '@/client/components/ui/label'
import { Separator } from '@/client/components/ui/separator'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <Separator />
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

function ColorSwatch({ name, className, textClass }: { name: string; className: string; textClass?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`h-16 w-16 rounded-lg border shadow-sm ${className}`} />
      <span className={`text-xs font-medium ${textClass ?? ''}`}>{name}</span>
    </div>
  )
}

export function DesignSystemPage() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [dialogOpen, setDialogOpen] = useState(false)

  function toggleDarkMode() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">KinBot Design System</h1>
              <p className="text-sm text-muted-foreground">
                Visual showcase &mdash; validate all tokens, components, and patterns
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleDarkMode}>
              {isDark ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
              {isDark ? 'Light mode' : 'Dark mode'}
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-12 px-6 py-10">
          {/* ─── COLOR PALETTE ─────────────────────────────────────── */}
          <Section title="Color Palette">
            <SubSection title="Primary, Secondary, Accent">
              <div className="flex flex-wrap gap-4">
                <ColorSwatch name="Primary" className="bg-primary" />
                <ColorSwatch name="Primary FG" className="bg-primary-foreground border" />
                <ColorSwatch name="Secondary" className="bg-secondary" />
                <ColorSwatch name="Secondary FG" className="bg-secondary-foreground" />
                <ColorSwatch name="Accent" className="bg-accent" />
                <ColorSwatch name="Accent FG" className="bg-accent-foreground" />
              </div>
            </SubSection>

            <SubSection title="Semantic Colors">
              <div className="flex flex-wrap gap-4">
                <ColorSwatch name="Success" className="bg-success" />
                <ColorSwatch name="Warning" className="bg-warning" />
                <ColorSwatch name="Destructive" className="bg-destructive" />
                <ColorSwatch name="Info" className="bg-info" />
              </div>
            </SubSection>

            <SubSection title="Background & Surface">
              <div className="flex flex-wrap gap-4">
                <ColorSwatch name="Background" className="bg-background border" />
                <ColorSwatch name="Card" className="bg-card border" />
                <ColorSwatch name="Popover" className="bg-popover border" />
                <ColorSwatch name="Muted" className="bg-muted" />
                <ColorSwatch name="Sidebar" className="bg-sidebar border" />
              </div>
            </SubSection>

            <SubSection title="Text Colors">
              <div className="flex flex-wrap gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Foreground (primary text)</p>
                  <p className="text-xs text-foreground">The quick brown fox jumps over the lazy dog</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground">Muted foreground</p>
                  <p className="text-xs text-muted-foreground">The quick brown fox jumps over the lazy dog</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-primary">Primary text</p>
                  <p className="text-xs text-primary">The quick brown fox jumps over the lazy dog</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-destructive">Destructive text</p>
                  <p className="text-xs text-destructive">The quick brown fox jumps over the lazy dog</p>
                </div>
              </div>
            </SubSection>

            <SubSection title="Chat Bubble Colors">
              <div className="flex flex-wrap gap-4">
                <ColorSwatch name="User" className="bg-bubble-user" />
                <ColorSwatch name="Kin" className="bg-bubble-kin border" />
                <ColorSwatch name="System" className="bg-bubble-system border" />
              </div>
            </SubSection>
          </Section>

          {/* ─── TYPOGRAPHY ──────────────────────────────────────── */}
          <Section title="Typography">
            <SubSection title="Headings">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight">Heading 1 &mdash; The quick brown fox</h1>
                <h2 className="text-3xl font-bold tracking-tight">Heading 2 &mdash; The quick brown fox</h2>
                <h3 className="text-2xl font-semibold tracking-tight">Heading 3 &mdash; The quick brown fox</h3>
                <h4 className="text-xl font-semibold">Heading 4 &mdash; The quick brown fox</h4>
                <h5 className="text-lg font-medium">Heading 5 &mdash; The quick brown fox</h5>
                <h6 className="text-base font-medium">Heading 6 &mdash; The quick brown fox</h6>
              </div>
            </SubSection>

            <SubSection title="Text Sizes">
              <div className="space-y-2">
                <p className="text-lg">Body large (text-lg) &mdash; The quick brown fox jumps over the lazy dog.</p>
                <p className="text-base">Body (text-base) &mdash; The quick brown fox jumps over the lazy dog.</p>
                <p className="text-sm">Small (text-sm) &mdash; The quick brown fox jumps over the lazy dog.</p>
                <p className="text-xs">Caption (text-xs) &mdash; The quick brown fox jumps over the lazy dog.</p>
              </div>
            </SubSection>

            <SubSection title="Font Weights">
              <div className="space-y-1">
                <p className="font-normal">Regular (400) &mdash; The quick brown fox jumps over the lazy dog.</p>
                <p className="font-medium">Medium (500) &mdash; The quick brown fox jumps over the lazy dog.</p>
                <p className="font-semibold">Semibold (600) &mdash; The quick brown fox jumps over the lazy dog.</p>
                <p className="font-bold">Bold (700) &mdash; The quick brown fox jumps over the lazy dog.</p>
              </div>
            </SubSection>
          </Section>

          {/* ─── BUTTONS ─────────────────────────────────────────── */}
          <Section title="Buttons">
            <SubSection title="Variants">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </SubSection>

            <SubSection title="Sizes">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </SubSection>

            <SubSection title="With Icons">
              <div className="flex flex-wrap items-center gap-3">
                <Button><Plus className="size-4" /> Create Kin</Button>
                <Button variant="outline"><Settings className="size-4" /> Settings</Button>
                <Button variant="destructive"><Trash2 className="size-4" /> Delete</Button>
                <Button variant="ghost" size="icon"><Bell className="size-4" /></Button>
                <Button variant="ghost" size="icon-sm"><Search className="size-4" /></Button>
              </div>
            </SubSection>

            <SubSection title="States">
              <div className="flex flex-wrap items-center gap-3">
                <Button>Default</Button>
                <Button disabled>Disabled</Button>
                <Button disabled><Loader2 className="size-4 animate-spin" /> Loading...</Button>
              </div>
            </SubSection>
          </Section>

          {/* ─── INPUTS ──────────────────────────────────────────── */}
          <Section title="Inputs">
            <SubSection title="Text Input">
              <div className="grid max-w-md gap-4">
                <div className="space-y-2">
                  <Label htmlFor="input-default">Default input</Label>
                  <Input id="input-default" placeholder="Type something..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input-with-value">With value</Label>
                  <Input id="input-with-value" defaultValue="Hello KinBot" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input-error">With error</Label>
                  <Input id="input-error" aria-invalid="true" defaultValue="invalid@" />
                  <p className="text-sm text-destructive">Please enter a valid email address</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input-disabled">Disabled</Label>
                  <Input id="input-disabled" disabled placeholder="Can't touch this" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input-icon">With icon</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="input-icon" className="pl-9" placeholder="Search..." />
                  </div>
                </div>
              </div>
            </SubSection>

            <SubSection title="Textarea">
              <div className="grid max-w-md gap-4">
                <div className="space-y-2">
                  <Label htmlFor="textarea-default">Message</Label>
                  <Textarea id="textarea-default" placeholder="Write your message here..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textarea-disabled">Disabled</Label>
                  <Textarea id="textarea-disabled" disabled placeholder="Not editable" />
                </div>
              </div>
            </SubSection>

            <SubSection title="Select">
              <div className="grid max-w-md gap-4">
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude">Claude Sonnet 4</SelectItem>
                      <SelectItem value="gpt4">GPT-4o</SelectItem>
                      <SelectItem value="gemini">Gemini 2.5 Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SubSection>
          </Section>

          {/* ─── CARDS ───────────────────────────────────────────── */}
          <Section title="Cards">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Card</CardTitle>
                  <CardDescription>A simple card with header and content.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is the card body content. It can contain any elements.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Card with Footer</CardTitle>
                  <CardDescription>Has actions at the bottom.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Some content explaining the purpose of this card.
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button size="sm">Save</Button>
                  <Button variant="outline" size="sm">Cancel</Button>
                </CardFooter>
              </Card>

              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>Interactive Card</CardTitle>
                  <CardDescription>Hover to see the shadow effect.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This card has a hover state with an elevated shadow.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ─── BADGES ──────────────────────────────────────────── */}
          <Section title="Badges">
            <SubSection title="Variants">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </SubSection>

            <SubSection title="Semantic (custom)">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-success text-success-foreground">Success</Badge>
                <Badge className="bg-warning text-warning-foreground">Warning</Badge>
                <Badge className="bg-destructive text-destructive-foreground">Error</Badge>
                <Badge className="bg-info text-info-foreground">Info</Badge>
              </div>
            </SubSection>

            <SubSection title="Use Cases">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">Queue: 3</Badge>
                <Badge className="bg-success text-success-foreground">Online</Badge>
                <Badge className="bg-warning text-warning-foreground">Processing</Badge>
                <Badge variant="outline">v1.0.0</Badge>
              </div>
            </SubSection>
          </Section>

          {/* ─── ALERTS ──────────────────────────────────────────── */}
          <Section title="Alerts">
            <div className="max-w-2xl space-y-4">
              <Alert>
                <Info className="size-4" />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>
                  This is an informational alert with an icon.
                </AlertDescription>
              </Alert>

              <Alert className="border-success/50 text-success [&>svg]:text-success">
                <CheckCircle className="size-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your provider has been configured successfully.
                </AlertDescription>
              </Alert>

              <Alert className="border-warning/50 text-warning [&>svg]:text-warning">
                <AlertTriangle className="size-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  The embedding provider is not configured. Memory search will be limited.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to connect to the Anthropic API. Please check your API key.
                </AlertDescription>
              </Alert>
            </div>
          </Section>

          {/* ─── CHECKBOXES, RADIOS, SWITCHES ────────────────────── */}
          <Section title="Checkboxes, Radios, Switches">
            <div className="grid gap-8 sm:grid-cols-3">
              <SubSection title="Checkboxes">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="check-1" defaultChecked />
                    <Label htmlFor="check-1">Remember me</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="check-2" />
                    <Label htmlFor="check-2">Accept terms</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="check-3" disabled />
                    <Label htmlFor="check-3" className="text-muted-foreground">Disabled</Label>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Radio Buttons">
                <RadioGroup defaultValue="claude">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="claude" id="radio-claude" />
                    <Label htmlFor="radio-claude">Claude</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="gpt" id="radio-gpt" />
                    <Label htmlFor="radio-gpt">GPT-4</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="gemini" id="radio-gemini" />
                    <Label htmlFor="radio-gemini">Gemini</Label>
                  </div>
                </RadioGroup>
              </SubSection>

              <SubSection title="Switches">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch id="switch-dark" defaultChecked />
                    <Label htmlFor="switch-dark">Dark mode</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="switch-notif" />
                    <Label htmlFor="switch-notif">Notifications</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="switch-disabled" disabled />
                    <Label htmlFor="switch-disabled" className="text-muted-foreground">Disabled</Label>
                  </div>
                </div>
              </SubSection>
            </div>
          </Section>

          {/* ─── DIALOG / MODAL ──────────────────────────────────── */}
          <Section title="Dialog / Modal">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new Kin</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create a new AI assistant.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="dialog-name">Name</Label>
                    <Input id="dialog-name" placeholder="e.g. Financial Advisor" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dialog-role">Role</Label>
                    <Input id="dialog-role" placeholder="e.g. Expert in personal finance" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dialog-model">Model</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claude">Claude Sonnet 4</SelectItem>
                        <SelectItem value="gpt4">GPT-4o</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => setDialogOpen(false)}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Section>

          {/* ─── TABS, DROPDOWN, TOOLTIP ─────────────────────────── */}
          <Section title="Tabs, Dropdown, Tooltip">
            <div className="grid gap-8 sm:grid-cols-2">
              <SubSection title="Tabs">
                <Tabs defaultValue="chat" className="w-full">
                  <TabsList>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="memory">Memory</TabsTrigger>
                    <TabsTrigger value="tools">Tools</TabsTrigger>
                  </TabsList>
                  <TabsContent value="chat" className="mt-2 text-sm text-muted-foreground">
                    Chat panel content goes here.
                  </TabsContent>
                  <TabsContent value="memory" className="mt-2 text-sm text-muted-foreground">
                    Memory entries and search interface.
                  </TabsContent>
                  <TabsContent value="tools" className="mt-2 text-sm text-muted-foreground">
                    Tool configuration and custom tools.
                  </TabsContent>
                </Tabs>
              </SubSection>

              <div className="space-y-6">
                <SubSection title="Dropdown Menu">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <MoreHorizontal className="size-4" /> Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem><Pencil className="mr-2 size-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem><Copy className="mr-2 size-4" /> Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SubSection>

                <SubSection title="Tooltip">
                  <div className="flex gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon"><Settings className="size-4" /></Button>
                      </TooltipTrigger>
                      <TooltipContent>Settings</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon"><Bell className="size-4" /></Button>
                      </TooltipTrigger>
                      <TooltipContent>Notifications</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon"><Info className="size-4" /></Button>
                      </TooltipTrigger>
                      <TooltipContent>More info</TooltipContent>
                    </Tooltip>
                  </div>
                </SubSection>
              </div>
            </div>
          </Section>

          {/* ─── AVATARS ─────────────────────────────────────────── */}
          <Section title="Avatars">
            <SubSection title="Sizes">
              <div className="flex items-end gap-4">
                <div className="flex flex-col items-center gap-1">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">K</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">XS</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">KB</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">SM</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Avatar>
                    <AvatarFallback>KB</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">MD</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Avatar className="size-12">
                    <AvatarFallback>KB</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">LG</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Avatar className="size-16">
                    <AvatarFallback className="text-lg">KB</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">XL</span>
                </div>
              </div>
            </SubSection>

            <SubSection title="With Status Indicator">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="size-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-success" />
                  </div>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-secondary">
                        <User className="size-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">Offline</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="size-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-warning" />
                  </div>
                  <span className="text-xs text-muted-foreground">Busy</span>
                </div>
              </div>
            </SubSection>
          </Section>

          {/* ─── KINBOT PATTERNS ──────────────────────────────────── */}
          <Section title="KinBot Patterns">
            <SubSection title="Message Bubbles">
              <div className="max-w-2xl space-y-4">
                {/* User message — right aligned */}
                <div className="flex justify-end gap-2">
                  <div className="max-w-[75%] space-y-1">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-muted-foreground">Nicolas</span>
                      <span className="text-xs text-muted-foreground">14:32</span>
                    </div>
                    <div className="rounded-2xl rounded-br-sm bg-bubble-user px-4 py-2.5 text-bubble-user-foreground">
                      <p className="text-sm">Can you analyze my monthly expenses and suggest optimizations?</p>
                    </div>
                  </div>
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-secondary text-xs">
                      <User className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Kin message — left aligned */}
                <div className="flex gap-2">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <Bot className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[75%] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">Financial Advisor</span>
                      <span className="text-xs text-muted-foreground">14:32</span>
                    </div>
                    <div className="rounded-2xl rounded-bl-sm bg-bubble-kin px-4 py-2.5 text-bubble-kin-foreground">
                      <p className="text-sm">
                        Of course! I'll look at your recent transactions. I can see three areas where we could optimize:
                        subscriptions, dining, and transportation. Would you like a detailed breakdown?
                      </p>
                    </div>
                  </div>
                </div>

                {/* System / task message — centered, neutral */}
                <div className="flex justify-center">
                  <div className="rounded-xl bg-bubble-system px-4 py-2 text-bubble-system-foreground">
                    <p className="text-xs flex items-center gap-1.5">
                      <Clock className="size-3" />
                      Task "Expense Analysis" completed
                    </p>
                  </div>
                </div>

                {/* Cron message — centered, neutral */}
                <div className="flex justify-center">
                  <div className="rounded-xl bg-bubble-system px-4 py-2 text-bubble-system-foreground">
                    <p className="text-xs flex items-center gap-1.5">
                      <Clock className="size-3" />
                      Scheduled report generated at 09:00
                    </p>
                  </div>
                </div>
              </div>
            </SubSection>

            <SubSection title="Kin Card (Sidebar)">
              <div className="max-w-xs space-y-2">
                {/* Active kin */}
                <div className="flex cursor-pointer items-center gap-3 rounded-lg bg-sidebar-accent p-3 transition-colors">
                  <div className="relative">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="size-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-sidebar-accent bg-success" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium">Financial Advisor</p>
                      <Badge variant="secondary" className="ml-2 text-[10px]">2</Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">Expert in personal finance</p>
                  </div>
                </div>

                {/* Idle kin */}
                <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-sidebar-accent">
                  <div className="relative">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-secondary">
                        <Bot className="size-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-sidebar bg-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">Coding Assistant</p>
                    <p className="truncate text-xs text-muted-foreground">Full-stack developer</p>
                  </div>
                </div>

                {/* Processing kin */}
                <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-sidebar-accent">
                  <div className="relative">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="size-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-sidebar bg-warning animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium">Research Agent</p>
                      <Badge className="ml-2 bg-warning text-warning-foreground text-[10px]">
                        <Loader2 className="size-3 animate-spin" />
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">Processing task...</p>
                  </div>
                </div>
              </div>
            </SubSection>

            <SubSection title="Typing / Streaming Indicator">
              <div className="max-w-2xl">
                <div className="flex gap-2">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <Bot className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <span className="text-xs font-medium">Financial Advisor</span>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-bubble-kin px-4 py-3">
                      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              </div>
            </SubSection>

            <SubSection title="Task Status Indicators">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg border p-3">
                  <div className="size-2 rounded-full bg-muted-foreground" />
                  <span className="text-sm">Pending</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3">
                  <Loader2 className="size-4 animate-spin text-warning" />
                  <span className="text-sm">In Progress</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-success/50 bg-success/10 p-3">
                  <CheckCircle className="size-4 text-success" />
                  <span className="text-sm">Completed</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                  <AlertCircle className="size-4 text-destructive" />
                  <span className="text-sm">Failed</span>
                </div>
              </div>
            </SubSection>
          </Section>

          {/* ─── SPACING & LAYOUT ────────────────────────────────── */}
          <Section title="Spacing & Layout">
            <SubSection title="Spacing Scale">
              <div className="space-y-2">
                {[
                  { label: '4px', cls: 'w-1' },
                  { label: '8px', cls: 'w-2' },
                  { label: '12px', cls: 'w-3' },
                  { label: '16px', cls: 'w-4' },
                  { label: '24px', cls: 'w-6' },
                  { label: '32px', cls: 'w-8' },
                  { label: '48px', cls: 'w-12' },
                  { label: '64px', cls: 'w-16' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="w-10 text-xs text-muted-foreground text-right">{item.label}</span>
                    <div className={`h-4 rounded bg-primary ${item.cls}`} />
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Border Radius">
              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'sm (6px)', cls: 'rounded-sm' },
                  { label: 'md (8px)', cls: 'rounded-md' },
                  { label: 'lg (12px)', cls: 'rounded-lg' },
                  { label: 'xl (16px)', cls: 'rounded-xl' },
                  { label: '2xl (24px)', cls: 'rounded-2xl' },
                  { label: 'full', cls: 'rounded-full' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1.5">
                    <div className={`size-16 border-2 border-primary bg-primary/10 ${item.cls}`} />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Shadows">
              <div className="flex flex-wrap gap-6">
                {[
                  { label: 'shadow-sm', cls: 'shadow-sm' },
                  { label: 'shadow-md', cls: 'shadow-md' },
                  { label: 'shadow-lg', cls: 'shadow-lg' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1.5">
                    <div className={`size-20 rounded-lg border bg-card ${item.cls}`} />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </SubSection>
          </Section>

          {/* ─── DARK MODE NOTE ──────────────────────────────────── */}
          <Section title="Dark Mode">
            <Card className="max-w-2xl">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Toggle dark mode using the button in the header. All components above should render correctly
                  in both light and dark mode. Dark mode uses warm tones (no pure black) for a comfortable
                  reading experience.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={toggleDarkMode}>
                    {isDark ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
                    Switch to {isDark ? 'light' : 'dark'} mode
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Current: <strong>{isDark ? 'Dark' : 'Light'}</strong>
                  </span>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Footer */}
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>KinBot Design System &mdash; This page is only available in development mode.</p>
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
