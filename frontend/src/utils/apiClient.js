const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('aptcomm_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        localStorage.removeItem('aptcomm_token');
        localStorage.removeItem('aptcomm_user');
        if (!window.location.pathname.endsWith('/login')) {
          window.location.href = '/login';
        }
      }

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { message: text };
      }

      if (!response.ok) {
        const errorMsg = data.message || (typeof data === 'string' ? data : null) || 'Request failed';
        return Promise.reject(errorMsg);
      }

      return data;
    } catch (error) {
      return Promise.reject(error || 'Network connectivity error');
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};
