export interface Org {
  id: string;
  name: string;
  slug: string;
  status: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  org_id: string;
  company_id: string | null;
  email: string;
  name: string | null;
  role: 'owner' | 'admin' | 'memory_manager' | 'member';
  status: 'active' | 'invited' | 'suspended' | 'deleted';
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  org_id: string;
  key_prefix: string;
  name: string;
  user_id: string | null;
  role: string;
  scopes: string[] | null;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface ApiKeyCreated extends ApiKey {
  plaintext_key: string;
}

export interface Namespace {
  id: string;
  org_id: string;
  company_id: string | null;
  name: string;
  path: string;
  parent_path: string | null;
  level: number;
  node_type: 'personal' | 'team' | 'department' | 'project';
  owner_id: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface NamespaceTreeNode extends Namespace {
  children: NamespaceTreeNode[];
}

export interface Memory {
  id: string;
  namespace: string;
  topic_key: string | null;
  title: string;
  content: string;
  kind: 'episodic' | 'semantic' | 'procedural';
  observation_type: string;
  visibility: 'personal' | 'namespace' | 'org';
  confidence: number;
  retention: string;
  importance: number;
  tags: string[] | null;
  files: string[] | null;
  layer: string;
  access_count: number;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  org_id: string;
  memory_id: string;
  source_ns: string;
  target_ns: string;
  score: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  comments: string;
}

export interface DashboardStats {
  users: number;
  namespaces: number;
  memories: number;
  pending_approvals: number;
  api_keys: number;
}

export interface Me {
  org_id: string;
  user_id: string;
  role: string;
  scopes: string[] | null;
  is_admin: boolean;
}

export interface Paginated<T> {
  data: T[];
  count: number;
  limit: number;
  offset: number;
}

export interface ApiError {
  error: string;
}

export interface UserProfile {
  id: string;
  org_id: string;
  email: string;
  name: string | null;
  role: 'owner' | 'admin' | 'memory_manager' | 'member';
  status: string;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    org_id: string;
  };
}
