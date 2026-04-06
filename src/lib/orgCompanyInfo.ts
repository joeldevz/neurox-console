import type { Org } from '@/types/api'

export interface OrgCompanyInfoDraft {
  display_name: string
  legal_name: string
  description: string
  website: string
}

export interface OrgCompanyInfoState {
  editable: boolean
  isFirstTimeSetup: boolean
  reason?: string
  draft: OrgCompanyInfoDraft
}

export function deriveOrgCompanyInfoState(org: Org): OrgCompanyInfoState {
  const companyInfo = org.settings?.company_info

  if (
    companyInfo !== null &&
    companyInfo !== undefined &&
    typeof companyInfo === 'object' &&
    !Array.isArray(companyInfo)
  ) {
    const ci = companyInfo as Record<string, unknown>
    return {
      editable: true,
      isFirstTimeSetup: false,
      draft: {
        display_name: typeof ci.display_name === 'string' ? ci.display_name : '',
        legal_name: typeof ci.legal_name === 'string' ? ci.legal_name : '',
        description: typeof ci.description === 'string' ? ci.description : '',
        website: typeof ci.website === 'string' ? ci.website : '',
      },
    }
  }

  // First-time setup: company_info is absent but org profile editing is supported
  return {
    editable: true,
    isFirstTimeSetup: true,
    reason: 'Structured company info is not present in the current org payload.',
    draft: {
      display_name: '',
      legal_name: '',
      description: '',
      website: '',
    },
  }
}

export function buildOrgCompanyInfoPatch(
  org: Org,
  draft: OrgCompanyInfoDraft
): Partial<Org> {
  return {
    settings: {
      ...org.settings,
      company_info: {
        ...(((org.settings as Record<string, unknown>).company_info as Record<string, unknown>) ?? {}),
        display_name: draft.display_name,
        legal_name: draft.legal_name,
        description: draft.description,
        website: draft.website,
      },
    },
  }
}
