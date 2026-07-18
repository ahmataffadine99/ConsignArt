const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'An error occurred during the request');
  }

  return response.json();
};

export const authService = {
  login: async (email: string, password: string) => {
    const response = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Le backend avec TransformInterceptor renvoie { data: { access_token: ... }, meta, timestamp }
    const authData = response.data || response;
    const token = authData.accessToken || authData.access_token;
    
    if (token) {
      localStorage.setItem('token', token);
      
      // Decode JWT payload to get user info
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const user = {
          id: decodedPayload.sub,
          role: decodedPayload.role,
        };
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        console.error('Failed to parse JWT token');
      }
    }
    return authData;
  },
  register: async (userData: any) => {
    return fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

export const artworksService = {
  getAll: async () => {
    return fetchApi('/artworks');
  }
};

export const reportsService = {
  getGalleryReport: async (galleryId: string) => fetchApi(`/reports/gallery/${galleryId}`),
  getMyArtistReport: async () => fetchApi(`/reports/artist/me`),
  getAdminReport: async () => fetchApi(`/reports/admin`),
};

