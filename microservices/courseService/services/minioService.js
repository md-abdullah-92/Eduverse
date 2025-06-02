const { Client } = require('minio');

class MinioService {
  constructor() {
    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
      port: parseInt(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
    });
    this.bucketName = process.env.MINIO_BUCKET_NAME || 'lessonvideo';
  }

  async initializeBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName);
        console.log(`Bucket ${this.bucketName} created successfully`);
      }
    } catch (error) {
      console.error('Error initializing bucket:', error);
      throw error;
    }
  }

  async uploadVideo(fileBuffer, fileName, metadata = {}) {
    try {
      await this.initializeBucket();
      
      const etag = await this.client.putObject(
        this.bucketName,
        fileName,
        fileBuffer,
        fileBuffer.length,
        metadata
      );

      return {
        fileName,
        etag,
        url: this.getVideoUrl(fileName),
        size: fileBuffer.length
      };
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }

  getVideoUrl(fileName) {
    return `http://localhost:9000/lessonvideo/${fileName}`;
  }

  async getPresignedUrl(fileName, expiry = 24 * 60 * 60) {
    try {
      return await this.client.presignedGetObject(this.bucketName, fileName, expiry);
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      throw error;
    }
  }

  async deleteVideo(fileName) {
    try {
      await this.client.removeObject(this.bucketName, fileName);
      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  async listVideos(prefix = '') {
    try {
      const objects = [];
      const stream = this.client.listObjects(this.bucketName, prefix, true);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => objects.push(obj));
        stream.on('error', reject);
        stream.on('end', () => resolve(objects));
      });
    } catch (error) {
      console.error('Error listing videos:', error);
      throw error;
    }
  }
}

module.exports = new MinioService();