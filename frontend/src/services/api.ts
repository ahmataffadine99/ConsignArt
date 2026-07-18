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
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.accessToken || data.access_token) {
      localStorage.setItem('token', data.accessToken || data.access_token);
      if (data.user) {
         localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    return data;
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

