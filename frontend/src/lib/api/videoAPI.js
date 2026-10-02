import { deleteObject, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebaseConfig';

export const videoAPI = {
  upload: async (formData, onProgress) => {
    const file = formData.get('video');
    const courseId = formData.get('courseId');
    const lessonId = formData.get('lessonId');

    if (!(file instanceof File) || !courseId || !lessonId) {
      throw new Error('Video file, course ID, and lesson ID are required');
    }

    const fileName = `course-${courseId}/lesson-${lessonId}/${Date.now()}-${file.name}`;
    const uploadTask = uploadBytesResumable(ref(storage, fileName), file, {
      contentType: file.type || 'video/mp4',
      customMetadata: {
        originalName: file.name,
        courseId: String(courseId),
        lessonId: String(lessonId),
      },
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
            onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
          }
        },
        (error) => reject(new Error(error.message || 'Firebase video upload failed')),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            success: true,
            data: { fileName, url, size: file.size, originalName: file.name, courseId, lessonId },
          });
        }
      );
    });
  },

  getVideoUrl: async (filename) => {
    return getDownloadURL(ref(storage, filename));
  },

  deleteVideo: async (filename) => {
    await deleteObject(ref(storage, filename));
    return { success: true, message: 'Video deleted successfully' };
  }
};