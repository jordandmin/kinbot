import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/client/components/ui/button'
import { Textarea } from '@/client/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select'
import { KinSelector } from '@/client/components/common/KinSelector'
import { ConfirmDeleteButton } from '@/client/components/common/ConfirmDeleteButton'
import { Pencil, Bot, Globe, Lock, Plus, Check, X } from 'lucide-react'
import { api, toastError } from '@/client/lib/api'
import type { ContactNoteData, KinInfo } from './ContactCard'

interface ContactNotesProps {
  contactId: string
  notes: ContactNoteData[]
  kinInfo?: Map<string, KinInfo>
  onRefresh?: () => void
}

export function ContactNotes({ contactId, notes, kinInfo, onRefresh }: ContactNotesProps) {
  const { t } = useTranslation()

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [newNoteKinId, setNewNoteKinId] = useState('')
  const [newNoteScope, setNewNoteScope] = useState<'global' | 'private'>('global')
  const [newNoteContent, setNewNoteContent] = useState('')

  const kinEntries = kinInfo ? [...kinInfo.entries()] : []
  const kinOptions = kinEntries.map(([id, info]) => ({ id, name: info.name, avatarUrl: info.avatarUrl }))

  const startEdit = (note: ContactNoteData) => {
    setEditingNoteId(note.id)
    setEditContent(note.content)
  }

  const cancelEdit = () => {
    setEditingNoteId(null)
    setEditContent('')
  }

  const saveEdit = async (noteId: string) => {
    if (!editContent.trim()) return
    try {
      await api.patch(`/contacts/${contactId}/notes/${noteId}`, { content: editContent.trim() })
      toast.success(t('settings.contacts.noteSaved'))
      cancelEdit()
      onRefresh?.()
    } catch (err: unknown) {
      toastError(err)
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      await api.delete(`/contacts/${contactId}/notes/${noteId}`)
      toast.success(t('settings.contacts.noteDeleted'))
      onRefresh?.()
    } catch (err: unknown) {
      toastError(err)
    }
  }

  const startAddNote = () => {
    const firstKinId = kinInfo ? [...kinInfo.keys()][0] ?? '' : ''
    setNewNoteKinId(firstKinId)
    setNewNoteScope('global')
    setNewNoteContent('')
    setAddingNote(true)
  }

  const cancelAddNote = () => {
    setAddingNote(false)
  }

  const saveNewNote = async () => {
    if (!newNoteKinId || !newNoteContent.trim()) return
    try {
      await api.post(`/contacts/${contactId}/notes`, {
        kinId: newNoteKinId,
        scope: newNoteScope,
        content: newNoteContent.trim(),
      })
      toast.success(t('settings.contacts.noteAdded'))
      cancelAddNote()
      onRefresh?.()
    } catch (err: unknown) {
      toastError(err)
    }
  }

  if (notes.length === 0 && !addingNote) {
    if (kinEntries.length > 0) {
      return (
        <div className="ml-8 border-t pt-2">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-6 px-2" onClick={startAddNote}>
            <Plus className="size-3 mr-1" />
            {t('settings.contacts.addNote')}
          </Button>
        </div>
      )
    }
    return null
  }

  return (
    <div className="ml-8 space-y-1.5 border-t pt-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {t('settings.contacts.notes')}
        </p>
        {!addingNote && kinEntries.length > 0 && (
          <Button variant="ghost" size="icon-xs" onClick={startAddNote}>
            <Plus className="size-3" />
          </Button>
        )}
      </div>
      {notes.map((note) => {
        const kin = kinInfo?.get(note.kinId)
        const kinName = kin?.name ?? '?'
        const isPrivate = note.scope === 'private'
        const ScopeIcon = isPrivate ? Lock : Globe
        const isEditing = editingNoteId === note.id

        return (
          <div key={note.id} className="group flex items-start gap-2 text-xs">
            {kin?.avatarUrl ? (
              <img
                src={kin.avatarUrl}
                alt={kinName}
                className="size-5 rounded-full object-cover shrink-0 mt-0.5"
              />
            ) : (
              <Bot className="size-5 shrink-0 mt-0.5 text-muted-foreground" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-muted-foreground">{kinName}</span>
                <ScopeIcon className="size-3 text-muted-foreground/60" />
                {isPrivate && (
                  <span className="text-[10px] text-muted-foreground/60">
                    {t('settings.contacts.notesPrivate')}
                  </span>
                )}
                {!isEditing && (
                  <span className="ml-auto flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-xs" onClick={() => startEdit(note)}>
                      <Pencil className="size-2.5" />
                    </Button>
                    <ConfirmDeleteButton
                      onConfirm={() => deleteNote(note.id)}
                      description={t('settings.contacts.deleteNoteConfirm')}
                      iconSize="size-2.5"
                    />
                  </span>
                )}
              </div>
              {isEditing ? (
                <div className="mt-1 space-y-1">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="text-xs min-h-[3rem] resize-none"
                    rows={2}
                  />
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon-xs" onClick={cancelEdit}>
                      <X className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => saveEdit(note.id)}
                      disabled={!editContent.trim()}
                    >
                      <Check className="size-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-foreground/80 whitespace-pre-wrap">{note.content}</p>
              )}
            </div>
          </div>
        )
      })}

      {addingNote && (
        <div className="space-y-2 rounded-lg border border-dashed p-2">
          <div className="flex items-center gap-2">
            <KinSelector
              value={newNoteKinId}
              onValueChange={setNewNoteKinId}
              kins={kinOptions}
              placeholder={t('settings.contacts.noteKinPlaceholder')}
              triggerClassName="h-7 w-36 text-xs"
              autoHeight={false}
            />
            <Select value={newNoteScope} onValueChange={(v) => setNewNoteScope(v as 'global' | 'private')}>
              <SelectTrigger className="h-7 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  <span className="flex items-center gap-1.5"><Globe className="size-3" />{t('settings.contacts.noteGlobal')}</span>
                </SelectItem>
                <SelectItem value="private">
                  <span className="flex items-center gap-1.5"><Lock className="size-3" />{t('settings.contacts.noteScopePrivate')}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder={t('settings.contacts.noteContentPlaceholder')}
            className="text-xs min-h-[3rem] resize-none"
            rows={2}
          />
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="icon-xs" onClick={cancelAddNote}>
              <X className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={saveNewNote}
              disabled={!newNoteKinId || !newNoteContent.trim()}
            >
              <Check className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
