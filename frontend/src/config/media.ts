export const MEDIA_CONFIG = {
    // Base URL for accessing media files (MinIO/S3 bucket)
    BUCKET_URL: import.meta.env.VITE_MEDIA_BUCKET_URL || 'http://localhost:9000/cina-bucket/',
};

export const FILE_URL_PREFIX = MEDIA_CONFIG.BUCKET_URL;

/**
 * appends the bucket url to the relative path if needed
 */
export const getFullMediaUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Already absolute
    return `${MEDIA_CONFIG.BUCKET_URL}${path}`;
};
