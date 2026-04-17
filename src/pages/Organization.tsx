import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, AlertCircle } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'
import {
  deriveOrgCompanyInfoState,
  buildOrgCompanyInfoPatch,
  type OrgCompanyInfoDraft,
} from '@/lib/orgCompanyInfo'
import { getAdminCapabilities } from '@/lib/adminCapabilities'
import { useAuthContext } from '@/context/auth'

const WEBSITE_MAX_LENGTH = 2048

function validateWebsite(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) {
    return { valid: true }
  }

  if (url.length > WEBSITE_MAX_LENGTH) {
    return { valid: false, error: `Website URL must be at most ${WEBSITE_MAX_LENGTH} characters` }
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { valid: false, error: 'Website must be a valid URL (e.g., https://example.com)' }
  }

  const dangerousSchemes = ['javascript:', 'data:', 'vbscript:', 'file:']
  if (dangerousSchemes.includes(parsed.protocol.toLowerCase())) {
    return { valid: false, error: `URL scheme "${parsed.protocol}" is not allowed` }
  }

  return { valid: true }
}

export default function Organization() {
  const qc = useQueryClient()
  const { me } = useAuthContext()
  const isAdmin = me?.is_admin || me?.role === 'owner' || me?.role === 'admin'
  const capabilities = getAdminCapabilities()
  const orgProfileEditDisabled = !isAdmin || !capabilities.orgProfileEdit.supported
  const orgProfileEditReason = !isAdmin
    ? 'Only admins and owners can edit organization settings.'
    : capabilities.orgProfileEdit.reason

  const {
    data: org,
    isLoading,
    error: orgError,
  } = useQuery({
    queryKey: ['org'],
    queryFn: () => api.getOrg(),
  })

  const companyInfoState = useMemo(
    () => (org ? deriveOrgCompanyInfoState(org) : null),
    [org],
  )

  const [draft, setDraft] = useState<OrgCompanyInfoDraft>({
    display_name: '',
    legal_name: '',
    description: '',
    website: '',
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const [draftInitialized, setDraftInitialized] = useState(false)

  useEffect(() => {
    if (companyInfoState && !draftInitialized) {
      setDraft(companyInfoState.draft)
      setDraftInitialized(true)
    }
  }, [companyInfoState, draftInitialized])

  const mutation = useMutation({
    mutationFn: (data: Partial<Parameters<typeof api.patchOrg>[0]>) =>
      api.patchOrg(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org'] })
      toast.success('Organization updated')
      setValidationError(null)
    },
    onError: () => {
      toast.error('Failed to save changes')
    },
  })

  const handleSaveCompanyInfo = () => {
    if (!org || !companyInfoState?.editable || orgProfileEditDisabled) return

    const websiteValidation = validateWebsite(draft.website)
    if (!websiteValidation.valid) {
      setValidationError(websiteValidation.error ?? 'Invalid website URL')
      return
    }

    setValidationError(null)
    const patch = buildOrgCompanyInfoPatch(org, draft)
    mutation.mutate(patch)
  }

  if (isLoading) {
    return (
      <PageLayout title="Organization">
        <div className="space-y-4">
          <Skeleton className="h-48 w-full max-w-2xl" />
          <Skeleton className="h-48 w-full max-w-2xl" />
        </div>
      </PageLayout>
    )
  }

  if (orgError) {
    return (
      <PageLayout title="Organization">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Organization
          </h1>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load organization: {orgError.message}
            </AlertDescription>
          </Alert>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Organization">
      <div className="space-y-6 max-w-2xl">
        {/* Page header */}
        <section>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Organization
          </h1>
        </section>
        {/* Company Information Card */}
        <Card className="bg-surface-2 border border-border-subtle rounded-lg">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {companyInfoState?.isFirstTimeSetup && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This is the first-time setup for your company information.
                  Fill in the details below to initialize your organization profile.
                </AlertDescription>
              </Alert>
            )}

            {orgProfileEditDisabled && orgProfileEditReason && (
              <Alert>
                <AlertDescription>{orgProfileEditReason}</AlertDescription>
              </Alert>
            )}

            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {companyInfoState?.editable ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={draft.display_name}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, display_name: e.target.value }))
                    }
                    disabled={mutation.isPending || orgProfileEditDisabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal-name">Legal Name</Label>
                  <Input
                    id="legal-name"
                    value={draft.legal_name}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, legal_name: e.target.value }))
                    }
                    disabled={mutation.isPending || orgProfileEditDisabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={draft.description}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, description: e.target.value }))
                    }
                    disabled={mutation.isPending || orgProfileEditDisabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={draft.website}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, website: e.target.value }))
                    }
                    disabled={mutation.isPending || orgProfileEditDisabled}
                  />
                </div>
                <Button
                  onClick={handleSaveCompanyInfo}
                  disabled={mutation.isPending || orgProfileEditDisabled}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {mutation.isPending ? 'Saving…' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                  {companyInfoState?.reason}
                </p>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-text-tertiary mb-1">
                      Display Name
                    </p>
                    <p className="text-sm text-text-primary">—</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Legal Name</Label>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-text-tertiary mb-1">
                      Legal Name
                    </p>
                    <p className="text-sm text-text-primary">—</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-text-tertiary mb-1">
                      Description
                    </p>
                    <p className="text-sm text-text-primary">—</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-text-tertiary mb-1">
                      Website
                    </p>
                    <p className="text-sm text-text-primary">—</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Metadata Card */}
        <Card className="bg-surface-2 border border-border-subtle rounded-lg">
          <CardHeader>
            <CardTitle>System Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-text-tertiary mb-1">
                Organization ID
              </p>
              <p className="text-sm text-text-primary font-mono">{org?.id ?? '—'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-text-tertiary mb-1">
                Name
              </p>
              <p className="text-sm text-text-primary font-mono">{org?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-text-tertiary mb-1">
                Slug
              </p>
              <p className="text-sm text-text-primary font-mono">{org?.slug ?? '—'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-text-tertiary mb-1">
                Status
              </p>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold capitalize',
                  STATUS_COLORS[org?.status as keyof typeof STATUS_COLORS] ?? 
                    STATUS_COLORS.pending
                )}
              >
                {org?.status ?? '—'}
              </span>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-text-tertiary mb-1">
                Created At
              </p>
              <p className="text-sm text-text-primary">
                {org?.created_at ? new Date(org.created_at).toLocaleString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-text-tertiary mb-1">
                Updated At
              </p>
              <p className="text-sm text-text-primary">
                {org?.updated_at ? new Date(org.updated_at).toLocaleString() : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
