export interface FeatureCapability {
  supported: boolean
  reason?: string
}

export interface AdminCapabilities {
  namespaceCreate: FeatureCapability
  namespaceEdit: FeatureCapability
  orgProfileEdit: FeatureCapability
  orgMemoryCreate: FeatureCapability
}

export function getAdminCapabilities(): AdminCapabilities {
  return {
    namespaceCreate: { supported: true },
    namespaceEdit: { supported: true },
    orgProfileEdit: { supported: true },
    orgMemoryCreate: { supported: true },
  }
}
