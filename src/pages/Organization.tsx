import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, AlertCircle } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api } from '@/lib/api'
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
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load organization: {orgError.message}
          </AlertDescription>
        </Alert>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Organization"
      description="View and update your organization settings"
    >
      <div className="space-y-6 max-w-2xl">
        {/* Company Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {companyInfoState?.isFirstTimeSetup && (
              <Alert>
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
                  <Input
                    id="description"
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
                <p className="text-sm text-muted-foreground">
                  {companyInfoState?.reason}
                </p>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input value="" readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>Legal Name</Label>
                  <Input value="" readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value="" readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value="" readOnly disabled />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Metadata Card */}
        <Card>
          <CardHeader>
            <CardTitle>System Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={org?.name ?? ''}
                readOnly
                className="text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={org?.slug ?? ''}
                readOnly
                className="text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input
                value={org?.status ?? ''}
                readOnly
                className="text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Created At</Label>
              <Input
                value={org?.created_at ? new Date(org.created_at).toLocaleString() : ''}
                readOnly
                className="text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Updated At</Label>
              <Input
                value={org?.updated_at ? new Date(org.updated_at).toLocaleString() : ''}
                readOnly
                className="text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
