const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private getHeaders(isFormData = false): HeadersInit {
    const token = localStorage.getItem('dineai_token');
    const workspaceId = localStorage.getItem('dineai_workspace_id');

    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (workspaceId) {
      headers['X-Workspace-ID'] = workspaceId;
    }
    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}, isFormData = false): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...this.getHeaders(isFormData), ...options.headers };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth
  async login(credentials: { email: string; password: string }) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: { email: string; password: string; full_name: string; restaurant_name?: string; restaurant_type?: string }) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Workspace & Settings
  async getCurrentWorkspace() {
    return this.request<any>('/workspaces/current');
  }

  async updateWorkspace(data: any) {
    return this.request<any>('/workspaces/current', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateSettings(data: any) {
    return this.request<any>('/workspaces/current/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getMembers() {
    return this.request<any[]>('/workspaces/current/members');
  }

  async inviteMember(data: any) {
    return this.request<any>('/workspaces/current/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Menu Studio
  async getCategories() {
    return this.request<any[]>('/menus/categories');
  }

  async createCategory(data: { name: string; description?: string; display_order?: number }) {
    return this.request<any>('/menus/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number) {
    return this.request<any>(`/menus/categories/${id}`, { method: 'DELETE' });
  }

  async getMenuItems(params?: { category_id?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params?.category_id) query.append('category_id', params.category_id.toString());
    if (params?.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any[]>(`/menus/items${qs}`);
  }

  async createMenuItem(data: any) {
    return this.request<any>('/menus/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(id: number, data: any) {
    return this.request<any>(`/menus/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenuItem(id: number) {
    return this.request<any>(`/menus/items/${id}`, { method: 'DELETE' });
  }

  async generateAiDescription(data: { dish_name: string; category_name?: string; key_ingredients?: string[]; dietary_type?: string }) {
    return this.request<any>('/menus/generate-description', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadMenuPdf(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<any>('/menus/upload-pdf', {
      method: 'POST',
      body: formData,
    }, true);
  }

  async approveImportedDishes(items: any[]) {
    return this.request<any>('/menus/approve-imported', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  // Public QR Menu
  async getPublicMenu(slug: string) {
    return this.request<any>(`/public/menu/${slug}`);
  }

  async askMenuAssistant(slug: string, data: { message: string; conversation_history?: any[]; dietary_filter?: string; table_number?: string }) {
    return this.request<any>(`/public/menu/${slug}/ai-assistant`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async placeOrder(slug: string, data: any) {
    return this.request<any>(`/public/menu/${slug}/order`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPublicOrderStatus(slug: string, orderNumber: string) {
    return this.request<any>(`/public/menu/${slug}/order-status/${orderNumber}`);
  }

  // Staff Orders
  async getOrders(statusFilter?: string) {
    const qs = statusFilter ? `?status_filter=${statusFilter}` : '';
    return this.request<any[]>(`/orders${qs}`);
  }

  async updateOrderStatus(id: number, status: string, notes?: string) {
    return this.request<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Reviews
  async getReviews(params?: { sentiment?: string; min_rating?: number }) {
    const query = new URLSearchParams();
    if (params?.sentiment) query.append('sentiment', params.sentiment);
    if (params?.min_rating) query.append('min_rating', params.min_rating.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any[]>(`/reviews${qs}`);
  }

  async createReview(data: any) {
    return this.request<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async importReviewsCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<any>('/reviews/import-csv', {
      method: 'POST',
      body: formData,
    }, true);
  }

  async getReviewIntelligence() {
    return this.request<any>('/reviews/intelligence-summary');
  }

  async generateReviewReply(reviewId: number, data: { tone: string; language: string }) {
    return this.request<any>(`/reviews/${reviewId}/generate-reply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveReviewReply(draftId: number, data: { edited_text?: string }) {
    return this.request<any>(`/reviews/drafts/${draftId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Sales Analytics
  async getSalesSummary(days = 14) {
    return this.request<any>(`/analytics/summary?days=${days}`);
  }

  async importSalesCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<any>('/analytics/import-csv', {
      method: 'POST',
      body: formData,
    }, true);
  }

  // Waste Intelligence
  async getWasteRecords() {
    return this.request<any[]>('/waste');
  }

  async recordWaste(data: any) {
    return this.request<any>('/waste', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWasteSummary() {
    return this.request<any>('/waste/summary');
  }

  // AI Action Engine
  async getActionInsights() {
    return this.request<any[]>('/actions');
  }

  async updateActionInsight(id: number, status: string) {
    return this.request<any>(`/actions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async refreshActionEngine() {
    return this.request<any[]>('/actions/refresh', { method: 'POST' });
  }

  // Seed Reset
  async resetDemoData() {
    return this.request<any>('/seed/reset', { method: 'POST' });
  }
}

export const api = new ApiClient();
