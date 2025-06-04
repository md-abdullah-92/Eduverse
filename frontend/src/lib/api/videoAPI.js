const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const videoAPI = {
  upload: async (formData, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || 'Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.open('POST', `${API_BASE_URL}/api/videos/upload`);
      xhr.send(formData);
    });
  },

  getVideoUrl: async (filename, secure = false) => {
    const response = await fetch(
      `${API_BASE_URL}/api/videos/${filename}/url?secure=${secure}`
    );
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    return data.url;
  },

  deleteVideo: async (filename) => {
    const response = await fetch(`${API_BASE_URL}/api/videos/${filename}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    return data;
  }
};