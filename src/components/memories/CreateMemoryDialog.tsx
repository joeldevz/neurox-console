import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CreateMemoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultVisibility: 'org' | 'namespace' | 'personal'
  namespaceOptions: Array<{ label: string; value: string }>
  onSubmit: (input: {
    namespace: string
    title: string
    content: string
    kind: 'episodic' | 'semantic' | 'procedural'
    observation_type: string
    visibility: 'org' | 'namespace' | 'personal'
    tags?: string[]
  }) => Promise<void>
}

export function CreateMemoryDialog({ open, onOpenChange, defaultVisibility, namespaceOptions, onSubmit }: CreateMemoryDialogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [namespace, setNamespace] = useState(namespaceOptions[0]?.value ?? 'default')
  const [kind, setKind] = useState<'episodic' | 'semantic' | 'procedural'>('semantic')
  const [observationType, setObservationType] = useState('decision')
  const [visibility, setVisibility] = useState(defaultVisibility)
  const [tags, setTags] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({
        namespace,
        title: title.trim(),
        content: content.trim(),
        kind,
        observation_type: observationType,
        visibility,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      })
      // Reset form
      setTitle('')
      setContent('')
      setTags('')
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create shared memory</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="mem-title">Title</Label>
            <Input id="mem-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Short, searchable title" />
          </div>
          <div>
            <Label htmlFor="mem-content">Content</Label>
            <Textarea id="mem-content" value={content} onChange={e => setContent(e.target.value)} placeholder="What / Why / Where / Learned" rows={5} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Namespace</Label>
              <Select value={namespace} onValueChange={setNamespace}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {namespaceOptions.map(ns => (
                    <SelectItem key={ns.value} value={ns.value}>{ns.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={v => setVisibility(v as typeof visibility)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="org">Organization</SelectItem>
                  <SelectItem value="namespace">Namespace</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Kind</Label>
              <Select value={kind} onValueChange={v => setKind(v as typeof kind)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="semantic">Semantic</SelectItem>
                  <SelectItem value="procedural">Procedural</SelectItem>
                  <SelectItem value="episodic">Episodic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={observationType} onValueChange={setObservationType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="decision">Decision</SelectItem>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="pattern">Pattern</SelectItem>
                  <SelectItem value="gotcha">Gotcha</SelectItem>
                  <SelectItem value="bugfix">Bug Fix</SelectItem>
                  <SelectItem value="config">Config</SelectItem>
                  <SelectItem value="preference">Preference</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="mem-tags">Tags (comma-separated)</Label>
            <Input id="mem-tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="tag1, tag2, tag3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || !title.trim() || !content.trim()}>
            {submitting ? 'Creating...' : 'Create memory'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
