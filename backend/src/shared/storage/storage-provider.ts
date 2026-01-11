/**
 * Abstract storage provider interface for file storage
 * Allows swapping implementations (LocalStorageProvider → S3StorageProvider) without changing business logic
 */
export interface StorageProvider {
  /**
   * Store a file and return the storage path
   */
  store(file: Buffer, filename: string, path: string): Promise<string>;

  /**
   * Retrieve a file by storage path
   */
  retrieve(storagePath: string): Promise<Buffer>;

  /**
   * Delete a file by storage path
   */
  delete(storagePath: string): Promise<void>;

  /**
   * Check if a file exists
   */
  exists(storagePath: string): Promise<boolean>;

  /**
   * Get a URL for accessing the file (for S3: signed URL, for local: relative path)
   */
  getUrl(storagePath: string): Promise<string>;
}

