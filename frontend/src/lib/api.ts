const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  }

  private setCookie(name: string, value: string) {
    const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
    const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
  }

  private removeCookie(name: string) {
    const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secure}`;
  }

  private setTokens(access: string, refresh: string) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    this.setCookie("access_token", access);
    this.setCookie("refresh_token", refresh);
  }

  private clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("organization_id");
    this.removeCookie("access_token");
    this.removeCookie("refresh_token");
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const token = this.getAccessToken();
    const allHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (token) {
      allHeaders["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: allHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        const token = this.getAccessToken();
        if (token) {
          allHeaders["Authorization"] = `Bearer ${token}`;
        }
        const retryRes = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers: allHeaders,
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!retryRes.ok) throw new Error(`API error: ${retryRes.status}`);
        return retryRes.json();
      }
      this.clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || error.error?.message || `API error: ${res.status}`);
    }

    return res.json();
  }

  async requestStream(endpoint: string, options: RequestOptions = {}): Promise<Response> {
    const { method = "GET", body, headers = {} } = options;

    const token = this.getAccessToken();
    const allHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (token) {
      allHeaders["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: allHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        allHeaders["Authorization"] = `Bearer ${this.getAccessToken()}`;
        const retryRes = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers: allHeaders,
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!retryRes.ok) throw new Error(`API error: ${retryRes.status}`);
        return retryRes;
      }
      this.clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || error.error?.message || `API error: ${res.status}`);
    }

    return res;
  }

  private async tryRefresh(): Promise<boolean> {
    const refresh = this.getRefreshToken();
    if (!refresh) return false;

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      this.setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  auth = {
    register: (data: { email: string; password: string; full_name: string }) =>
      this.request<{ access_token: string; refresh_token: string; user: any }>("/api/v1/auth/register", {
        method: "POST",
        body: data,
      }).then((res) => {
        // CRITICAL: check if res exists and has the expected properties
        if (!res || typeof res !== 'object') {
          throw new Error('Invalid response from register endpoint');
        }
        if (!res.access_token || !res.refresh_token) {
          throw new Error('Missing token data in register response');
        }
        this.setTokens(res.access_token, res.refresh_token);
        return res;
      }),

    login: (data: { email: string; password: string }) =>
      this.request<{ access_token: string; refresh_token: string; user: any }>("/api/v1/auth/login", {
        method: "POST",
        body: data,
      }).then((res) => {
        if (!res || typeof res !== 'object') {
          throw new Error('Invalid response from login endpoint');
        }
        if (!res.access_token || !res.refresh_token) {
          throw new Error('Missing token data in login response');
        }
        this.setTokens(res.access_token, res.refresh_token);
        return res;
      }),

    me: () => this.request<any>("/api/v1/auth/me"),

    logout: () => {
      this.clearTokens();
    },
  };

  organizations = {
    create: (data: { name: string }) =>
      this.request<any>("/api/v1/businesses/", { method: "POST", body: data }),
  };

  businesses = {
    create: (orgId: string, data: Record<string, unknown>) =>
      this.request<any>(`/api/v1/businesses/${orgId}/businesses`, { method: "POST", body: data }),

    list: (orgId: string) => this.request<any[]>(`/api/v1/businesses/${orgId}/businesses`),

    get: (orgId: string, id: string) => this.request<any>(`/api/v1/businesses/${orgId}/businesses/${id}`),

    update: (orgId: string, id: string, data: Record<string, unknown>) =>
      this.request<any>(`/api/v1/businesses/${orgId}/businesses/${id}`, { method: "PUT", body: data }),

    analyze: (orgId: string, id: string) =>
      this.request<any>(`/api/v1/businesses/${orgId}/businesses/${id}/analyze`, { method: "POST" }),
  };

  content = {
    generate: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/content/generate", { method: "POST", body: data }),

    list: (businessId: string) => this.request<any[]>(`/api/v1/content/${businessId}`),

    get: (assetId: string) => this.request<any>(`/api/v1/content/detail/${assetId}`),

    delete: (assetId: string) =>
      this.request<any>(`/api/v1/content/detail/${assetId}`, { method: "DELETE" }),
  };

  campaigns = {
    list: (businessId: string) => this.request<any[]>(`/api/v1/campaigns/${businessId}`),

    generate: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/campaigns/generate", { method: "POST", body: data }),

    create: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/campaigns", { method: "POST", body: data }),

    get: (id: string) => this.request<any>(`/api/v1/campaigns/detail/${id}`),

    update: (id: string, data: Record<string, unknown>) =>
      this.request<any>(`/api/v1/campaigns/detail/${id}`, { method: "PUT", body: data }),

    delete: (id: string) =>
      this.request<any>(`/api/v1/campaigns/detail/${id}`, { method: "DELETE" }),
  };

  seo = {
    analyze: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/seo/analyze", { method: "POST", body: data }),

    crawl: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/seo/crawl", { method: "POST", body: data }),

    list: (businessId: string) => this.request<any[]>(`/api/v1/seo/${businessId}`),

    get: (reportId: string) => this.request<any>(`/api/v1/seo/detail/${reportId}`),

    delete: (reportId: string) =>
      this.request<any>(`/api/v1/seo/detail/${reportId}`, { method: "DELETE" }),
  };

  ads = {
    generate: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/ads/generate", { method: "POST", body: data }),

    list: (businessId: string) => this.request<any[]>(`/api/v1/ads/${businessId}`),

    get: (adId: string) => this.request<any>(`/api/v1/ads/detail/${adId}`),

    delete: (adId: string) =>
      this.request<any>(`/api/v1/ads/detail/${adId}`, { method: "DELETE" }),
  };

  competitors = {
    analyze: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/competitors/analyze", { method: "POST", body: data }),

    list: (businessId: string) => this.request<any[]>(`/api/v1/competitors/${businessId}`),

    get: (competitorId: string) => this.request<any>(`/api/v1/competitors/detail/${competitorId}`),

    delete: (competitorId: string) =>
      this.request<any>(`/api/v1/competitors/detail/${competitorId}`, { method: "DELETE" }),
  };

  personas = {
    generate: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/personas/generate", { method: "POST", body: data }),

    list: (businessId: string) => this.request<any[]>(`/api/v1/personas/${businessId}`),

    get: (personaId: string) => this.request<any>(`/api/v1/personas/detail/${personaId}`),

    delete: (personaId: string) =>
      this.request<any>(`/api/v1/personas/detail/${personaId}`, { method: "DELETE" }),
  };

  analytics = {
    dashboard: (businessId: string) => this.request<any>(`/api/v1/analytics/dashboard/${businessId}`),

    predict: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/analytics/predict", { method: "POST", body: data }),
  };

  automation = {
    workflows: (businessId: string) => this.request<any[]>(`/api/v1/automation/workflows/${businessId}`),

    templates: () => this.request<any[]>("/api/v1/automation/templates"),

    create: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/automation/workflows", { method: "POST", body: data }),

    generate: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/automation/workflows/generate", { method: "POST", body: data }),

    get: (workflowId: string) => this.request<any>(`/api/v1/automation/workflows/detail/${workflowId}`),

    update: (workflowId: string, data: Record<string, unknown>) =>
      this.request<any>(`/api/v1/automation/workflows/detail/${workflowId}`, { method: "PUT", body: data }),

    delete: (workflowId: string) =>
      this.request<any>(`/api/v1/automation/workflows/detail/${workflowId}`, { method: "DELETE" }),

    activate: (id: string) =>
      this.request<any>(`/api/v1/automation/workflows/${id}/activate`, { method: "POST" }),

    deactivate: (id: string) =>
      this.request<any>(`/api/v1/automation/workflows/${id}/deactivate`, { method: "POST" }),
  };

  chat = {
    send: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/chat", { method: "POST", body: data }),

    history: (businessId: string) => this.request<any>(`/api/v1/chat/history/${businessId}`),

    clearHistory: (businessId: string) =>
      this.request<any>(`/api/v1/chat/history/${businessId}`, { method: "DELETE" }),
  };

  email = {
    send: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/email/send", { method: "POST", body: data }),

    generateTemplate: (data: Record<string, unknown>) =>
      this.request<any>("/api/v1/email/generate-template", { method: "POST", body: data }),

    templates: () => this.request<any[]>("/api/v1/email/templates"),
  };
}

export const api = new ApiClient(API_BASE);
