import type {
  Me, Org, User, ApiKey, ApiKeyCreated,
  Namespace, NamespaceTreeNode, Memory, Approval,
  DashboardStats, ApiError,
  UserProfile, LoginResponse,
} from '@/types/api'

const BASE = import.meta.env.VITE_API_URL || ''

// Global 401 callback — set by App.tsx after AuthProvider mounts
let unauthorizedCallback: (() => void) | null = null

export function setUnauthorizedCallback(cb: (() => void) | null) {
  unauthorizedCallback = cb
}

function getToken(): string | null {
  return localStorage.getItem('neurox_token')
}

export function setToken(token: string) {
  localStorage.setItem('neurox_token', token)
}

export function clearToken() {
  localStorage.removeItem('neurox_token')
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(path: string, options: RequestInit & { skipAuth?: boolean } = {}): Promise<T> {
    const { skipAuth, ...fetchOptions } = options
    const token = skipAuth ? null : getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers as Record<string, string>,
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${this.baseUrl}${path}`, { ...fetchOptions, headers })
    const body = await res.json()

    if (!res.ok) {
      const err = new ApiClientError(res.status, (body as ApiError).error || 'Unknown error')
      if (res.status === 401 && unauthorizedCallback) {
        unauthorizedCallback()
      }
      throw err
    }

    return body as T
  }

  private qs(params: Record<string, string | number | undefined>): string {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') q.set(k, String(v))
    }
    const s = q.toString()
    return s ? `?${s}` : ''
  }

  // Auth
  async me(): Promise<Me> {
    return this.request('/api/admin/me')
  }

  // Org
  async getOrg(): Promise<Org> {
    return this.request('/api/admin/org')
  }
  async patchOrg(data: Partial<Org>): Promise<Org> {
    return this.request('/api/admin/org', { method: 'PATCH', body: JSON.stringify(data) })
  }

  // Users
  async listUsers(limit = 50, offset = 0): Promise<{ users: User[]; count: number }> {
    return this.request(`/api/admin/users${this.qs({ limit, offset })}`)
  }
  async createUser(data: { email: string; name?: string; role?: string; status?: string }): Promise<User> {
    return this.request('/api/admin/users', { method: 'POST', body: JSON.stringify(data) })
  }
  async patchUser(id: string, data: Partial<User>): Promise<User> {
    return this.request(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  // API Keys
  async listApiKeys(): Promise<{ keys: ApiKey[]; count: number }> {
    return this.request('/api/admin/api-keys')
  }
  async createApiKey(data: { name: string; role?: string; scopes?: string[]; expires_at?: string }): Promise<ApiKeyCreated> {
    return this.request('/api/admin/api-keys', { method: 'POST', body: JSON.stringify(data) })
  }
  async revokeApiKey(id: string): Promise<ApiKey> {
    return this.request(`/api/admin/api-keys/${id}/revoke`, { method: 'POST' })
  }

  // Namespaces
  async listNamespaces(limit = 100, offset = 0): Promise<{ namespaces: Namespace[]; count: number }> {
    return this.request(`/api/admin/namespaces${this.qs({ limit, offset })}`)
  }
  async getNamespaceTree(): Promise<{ tree: NamespaceTreeNode[] }> {
    return this.request('/api/admin/namespaces/tree')
  }
  async createNamespace(data: { name: string; parent_path?: string; node_type?: string; owner_id?: string }): Promise<Namespace> {
    return this.request('/api/admin/namespaces', { method: 'POST', body: JSON.stringify(data) })
  }
  async patchNamespace(id: string, data: Partial<Namespace>): Promise<Namespace> {
    return this.request(`/api/admin/namespaces/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  // Memories
  async listMemories(params: { limit?: number; offset?: number; namespace?: string; query?: string; visibility?: string } = {}): Promise<{ memories: Memory[]; count: number }> {
    return this.request(`/api/admin/memories${this.qs(params as Record<string, string | number | undefined>)}`)
  }
  async getMemory(id: string): Promise<Memory> {
    return this.request(`/api/admin/memories/${id}`)
  }
  async searchMemories(data: { query: string; namespaces?: string[]; limit?: number }): Promise<{ results: (Memory & { score: number })[]; count: number }> {
    return this.request('/api/admin/memories/search', { method: 'POST', body: JSON.stringify(data) })
  }

  // Approvals
  async listApprovals(status = 'pending', limit = 50): Promise<{ approvals: Approval[]; count: number }> {
    return this.request(`/api/admin/approvals${this.qs({ status, limit })}`)
  }
  async approveApproval(id: string, comments = ''): Promise<{ status: string }> {
    return this.request(`/api/admin/approvals/${id}/approve`, { method: 'POST', body: JSON.stringify({ comments }) })
  }
  async rejectApproval(id: string, comments = ''): Promise<{ status: string }> {
    return this.request(`/api/admin/approvals/${id}/reject`, { method: 'POST', body: JSON.stringify({ comments }) })
  }

  // Dashboard
  async dashboardStats(): Promise<DashboardStats> {
    return this.request('/api/admin/dashboard/stats')
  }

  // Public auth
  async loginWithPassword(email: string, password: string): Promise<LoginResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    })
  }

  // Admin: set user password
  async setUserPassword(userId: string, password: string): Promise<{ ok: boolean }> {
    return this.request('/api/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, password }),
    })
  }

  // User portal
  async userMe(): Promise<UserProfile> {
    return this.request('/api/user/me')
  }
  async userMemories(params: { limit?: number; offset?: number; namespace?: string } = {}): Promise<{ memories: Memory[]; count: number }> {
    return this.request(`/api/user/memories${this.qs(params as Record<string, string | number | undefined>)}`)
  }
  async userNamespaces(): Promise<{ namespaces: Namespace[]; count: number }> {
    return this.request('/api/user/namespaces')
  }
}

export class ApiClientError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const api = new ApiClient(BASE)
