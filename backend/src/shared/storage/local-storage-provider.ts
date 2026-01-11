import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageProvider } from './storage-provider';
import { config } from '../config';

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor(baseDir: string = config.uploadDir) {
    this.baseDir = baseDir;
  }

  async store(file: Buffer, _filename: string, filePath: string): Promise<string> {
    // Sanitize path to prevent directory traversal
    const sanitizedPath = this.sanitizePath(filePath);
    const fullPath = path.join(this.baseDir, sanitizedPath);

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Write file
    await fs.writeFile(fullPath, file);

    return sanitizedPath;
  }

  async retrieve(storagePath: string): Promise<Buffer> {
    const sanitizedPath = this.sanitizePath(storagePath);
    const fullPath = path.join(this.baseDir, sanitizedPath);

    return fs.readFile(fullPath);
  }

  async delete(storagePath: string): Promise<void> {
    const sanitizedPath = this.sanitizePath(storagePath);
    const fullPath = path.join(this.baseDir, sanitizedPath);

    try {
      await fs.unlink(fullPath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async exists(storagePath: string): Promise<boolean> {
    const sanitizedPath = this.sanitizePath(storagePath);
    const fullPath = path.join(this.baseDir, sanitizedPath);

    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getUrl(storagePath: string): Promise<string> {
    // For local storage, return a relative path that the API can serve
    return `/api/evidence/files/${encodeURIComponent(storagePath)}`;
  }

  private sanitizePath(filePath: string): string {
    // Remove any path traversal attempts
    const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    return normalized;
  }
}

