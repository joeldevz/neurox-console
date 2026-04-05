import { useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'

export default function Organization() {
  const qc = useQueryClient()
  const nameRef = useRef<HTMLInputElement>(null)

  const { data: org, isLoading } = useQuery({
    queryKey: ['org'],
    queryFn: () => api.getOrg(),
  })

  const mutation = useMutation({
    mutationFn: (data: { name: string }) => api.patchOrg(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['org'] }),
  })

  if (isLoading) {
    return (
      <PageLayout title="Organization">
        <Skeleton className="h-48 w-full max-w-lg" />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Organization"
      description="View and update your organization settings"
    >
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              key={org?.id}
              ref={nameRef}
              defaultValue={org?.name}
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={org?.slug ?? ''}
              readOnly
              style={{ color: 'var(--text-muted)' }}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Input
              value={org?.status ?? ''}
              readOnly
              style={{ color: 'var(--text-muted)' }}
            />
          </div>
          <Button
            onClick={() => {
              const name = nameRef.current?.value.trim()
              if (name) mutation.mutate({ name })
            }}
            disabled={mutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {mutation.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
          {mutation.isSuccess && (
            <p className="text-sm" style={{ color: 'var(--color-success)' }}>
              Saved successfully.
            </p>
          )}
          {mutation.isError && (
            <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
              {mutation.error.message}
            </p>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  )
}
