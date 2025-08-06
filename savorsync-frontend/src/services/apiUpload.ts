import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance for uploads
const uploadAPI = axios.create({
  baseURL: `${API_BASE_URL}/upload`,
  timeout: 30000, // 30 seconds for uploads
});

// Create axios instance for profile uploads
const profileUploadAPI = axios.create({
  baseURL: `${API_BASE_URL}/profile-upload`,
  timeout: 30000, // 30 seconds for uploads
});

// Request interceptor to add auth token
uploadAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor for profile uploads
profileUploadAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
uploadAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Upload API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Response interceptor for profile uploads
profileUploadAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Profile Upload API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Upload profile image
export const uploadProfileImage = async (file: File): Promise<{ imageUrl: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('profileImage', file);

  const response = await profileUploadAPI.post('/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    imageUrl: response.data.imageUrl,
    publicId: response.data.publicId,
  };
};

// Upload profile image with progress tracking
export const uploadProfileImageWithProgress = async (
  file: File,
  onProgress?: UploadProgressCallback
): Promise<{ imageUrl: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('profileImage', file);

  const response = await profileUploadAPI.post('/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return {
    imageUrl: response.data.imageUrl,
    publicId: response.data.publicId,
  };
};

// Delete profile image
export const deleteProfileImage = async (publicId: string): Promise<void> => {
  await profileUploadAPI.delete(`/profile-image/${publicId}`);
};

// Upload single image
export const uploadImage = async (file: File): Promise<{ imageUrl: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await uploadAPI.post('/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    imageUrl: response.data.imageUrl,
    publicId: response.data.publicId,
  };
};

// Upload multiple images
export const uploadImages = async (files: File[]): Promise<Array<{ imageUrl: string; publicId: string; originalName: string }>> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await uploadAPI.post('/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.images;
};

// Delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<void> => {
  await uploadAPI.delete(`/image/${publicId}`);
};

// Upload progress callback type
export type UploadProgressCallback = (progress: number) => void;

// Upload with progress tracking
export const uploadImageWithProgress = async (
  file: File,
  onProgress?: UploadProgressCallback
): Promise<{ imageUrl: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await uploadAPI.post('/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return {
    imageUrl: response.data.imageUrl,
    publicId: response.data.publicId,
  };
}; 