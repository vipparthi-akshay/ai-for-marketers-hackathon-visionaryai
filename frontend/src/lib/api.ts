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

  private setTokens(access: string, refresh: string) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }

  private clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
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
        allHeaders["Authorization"] = `Bearer ${this.getAccessToken()}`;
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
      this.request<{ access_token: string; refresh_token: string; user: unknown }>("/api/v1/auth/register", {
        method: "POST",
        body: data,
      }).then((res) => {
        this.setTokens(res.access_token, res.refresh_token);
        return res;
      }),

    login: (data: { email: string; password: string }) =>
      this.request<{ access_token: string; refresh_token: string; user: unknown }>("/api/v1/auth/login", {
        method: "POST",
        body: data,
      }).then((res) => {
        this.setTokens(res.access_token, res.refresh_token);
        return res;
      }),

    me: () => this.request<unknown>("/api/v1/auth/me"),

    logout: () => {
      this.clearTokens();
    },
  };

  businesses = {
    create: (orgId: string, data: Record<string, unknown>) =>
      this.request<unknown>(`/api/v1/businesses/${orgId}/businesses`, { method: "POST", body: data }),

    list: (orgId: string) => this.request<unknown[]>(`/api/v1/businesses/${orgId}/businesses`),

    get: (orgId: string, id: string) => this.request<unknown>(`/api/v1/businesses/${orgId}/businesses/${id}`),

    update: (orgId: string, id: string, data: Record<string, unknown>) =>
      this.request<unknown>(`/api/v1/businesses/${orgId}/businesses/${id}`, { method: "PUT", body: data }),

    analyze: (orgId: string, id: string) =>
      this.request<unknown>(`/api/v1/businesses/${orgId}/businesses/${id}/analyze`, { method: "POST" }),
  };

  content = {
    generate: (data: Record<string, unknown>) =>
      this.request<unknown>("/api/v1/content/generate", { method: "POST", body: data }),

    list: (businessId: string) => this.request<unknown[]>(`/api/v1/content/${businessId}`),
  };

  campaigns = {
    list: (businessId: string) => this.request<unknown[]>(`/api/v1/campaigns/${businessId}`),

    generate: (data: Record<string, unknown>) =>
      this.request<unknown>("/api/v1/campaigns/generate", { method: "POST", body: data }),
  };

  seo = {
    analyze: (data: Record<string, unknown>) =>
      this.request<unknown>("/api/v1/seo/analyze", { method: "POST", body: data }),

    list: (businessId: string) => this.request<unknown[]>(`/api/v1/seo/${businessId}`),
  };

  ads = {
    generate: (data: Record<string, unknown>) =>
      this.request<unknown>("/api/v1/ads/generate", { method: "POST", body: data }),
  };

  competitors = {
    analyze: (data: Record<string, unknown>) =>
      this.request<unknown>("/api/v1/competitors/analyze", { method: "POST", body: data }),

    list: (businessId: string) => this.request<unknown[]>(`/api/v1/competitors/${businessId}`),
  };

  personas = {
    generate: (data: Record<string, unknown>) =>
      this.request<unknown>("/api/v1/personas/generate", { method: "POST", body: data }),

    list: (businessId: string) => this.request<unknown[]>(`/api/v1/personas/${businessId}`),
  };

  analytics = {
    dashboard: (businessId: string) => this.request<unknown>(`/api/v1/analytics/dashboard/${businessId}`),

    predict: (data: Record<string, unknown>) =>
      this.request<unknown>("/api/v1/analytics/predict", { method: "POST", body: data }),
  };

  automation = {
    workflows: (businessId: string) => this.request<unknown[]>(`/api/v1/automation/workflows/${businessId}`),

    templates: () => this.request<unknown[]>("/api/v1/automation/templates"),
  };

  chat = {
    send: (data: Record<string, unknown>) =>
      this.request<unknown>("/api/v1/chat", { method: "POST", body: data }),

    history: (businessId: string) => this.request<unknown>(`/api/v1/chat/history/${businessId}`),
  };
}

export const api = new ApiClient(API_BASE);
