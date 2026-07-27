const API_BASE = 'https://agent-orchestrator-production-a990.up.railway.app/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

export function getToken(): string | null {
  return authToken;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const body = await res.json();

  if (!res.ok) {
    return { error: body.error || 'Erro desconhecido' };
  }

  return { data: body.data || body };
}

// Auth
export async function login(email: string, password: string) {
  const res = await apiFetch<{ user: any; tenant_id: string; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res.data?.token) {
    setToken(res.data.token);
  }
  return res;
}

export async function signup(email: string, password: string) {
  const res = await apiFetch<{ user: any; tenant_id: string }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res;
}

export async function getSession() {
  return apiFetch<{ user_id: string; email: string; tenant_id: string }>('/auth/session');
}

export async function logout() {
  const res = await apiFetch('/auth/logout', { method: 'POST' });
  setToken(null);
  return res;
}

// Templates
export async function listTemplates() {
  return apiFetch<any[]>('/templates');
}

// Agents
export async function listAgents(tenantId: string) {
  return apiFetch<any[]>(`/tenants/${tenantId}/agents`);
}

export async function createAgent(tenantId: string, data: { name: string; type?: string; model?: string; system_prompt?: string }) {
  return apiFetch<any>(`/tenants/${tenantId}/agents`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAgent(tenantId: string, agentId: string) {
  return apiFetch<any>(`/tenants/${tenantId}/agents/${agentId}`, { method: 'DELETE' });
}

export async function createAgentFromTemplate(tenantId: string, templateId: string) {
  return apiFetch<any>(`/tenants/${tenantId}/templates/${templateId}`, { method: 'POST' });
}

// Agent execution
export async function runAgent(tenantId: string, agentId: string, input: string) {
  return apiFetch<any>(`/tenants/${tenantId}/agents/${agentId}/run`, {
    method: 'POST',
    body: JSON.stringify({ input }),
  });
}

export async function listRuns(tenantId: string, agentId: string) {
  return apiFetch<any[]>(`/tenants/${tenantId}/agents/${agentId}/runs`);
}

// Tools
export async function listAgentTools(tenantId: string, agentId: string) {
  return apiFetch<any[]>(`/tenants/${tenantId}/agents/${agentId}/tools`);
}

export async function addAgentTool(tenantId: string, agentId: string, data: { name: string; mcp_server: string; mcp_tool: string }) {
  return apiFetch<any>(`/tenants/${tenantId}/agents/${agentId}/tools`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAgentTool(tenantId: string, agentId: string, toolId: string) {
  return apiFetch<any>(`/tenants/${tenantId}/agents/${agentId}/tools/${toolId}`, { method: 'DELETE' });
}
