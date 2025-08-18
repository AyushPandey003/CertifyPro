import { createClient } from 'pexels';

// Initialize Pexels client
const pexelsClient = createClient(process.env.PEXELS_API_KEY || '');

export interface PexelsImage {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

export interface PexelsSearchResponse {
  photos: PexelsImage[];
  total_results: number;
  page: number;
  per_page: number;
  next_page?: string;
  prev_page?: string;
}

export class PexelsService {
  /**
   * Search for images by query
   */
  static async searchImages(query: string, page: number = 1, perPage: number = 20): Promise<PexelsSearchResponse> {
    try {
      if (!process.env.PEXELS_API_KEY) {
        throw new Error('PEXELS_API_KEY not configured');
      }

      const response = await pexelsClient.photos.search({
        query,
        page,
        per_page: perPage,
        orientation: 'landscape', // Good for certificates
        size: 'large', // High quality
      });

      // Check if response is an error
      if ('error' in response) {
        throw new Error(response.error);
      }

      // Map response to PexelsSearchResponse
      return {
        photos: response.photos.map((photo: (typeof response.photos)[number]) => ({
          ...photo,
          alt: photo.alt ?? '',
        })),
        total_results: response.total_results,
        page: response.page,
        per_page: response.per_page,
        next_page: typeof response.next_page === 'string' ? response.next_page : undefined,
      };
    } catch (error) {
      console.error('Pexels search error:', error);
      throw new Error('Failed to search Pexels images');
    }
  }

  /**
   * Get curated images (trending/featured)
   */
  static async getCuratedImages(page: number = 1, perPage: number = 20): Promise<PexelsSearchResponse> {
    try {
      if (!process.env.PEXELS_API_KEY) {
        throw new Error('PEXELS_API_KEY not configured');
      }

      const response = await pexelsClient.photos.curated({
        page,
        per_page: perPage,
      });

      // Check if response is an error
      if ('error' in response) {
        throw new Error(response.error);
      }

      // Map response to PexelsSearchResponse
      return {
        photos: response.photos.map((photo: (typeof response.photos)[number]) => ({
          ...photo,
          alt: photo.alt ?? '',
        })),
        total_results: 0, // Not available in curated response
        page: response.page,
        per_page: response.per_page,
        next_page: typeof response.next_page === 'string' ? response.next_page : undefined,
      };
    } catch (error) {
      console.error('Pexels curated error:', error);
      throw new Error('Failed to fetch curated images');
    }
  }

  /**
   * Get popular certificate-related images
   */
  static async getCertificateTemplates(): Promise<PexelsSearchResponse> {
    const certificateQueries = [
      'certificate background',
      'diploma template',
      'award ceremony',
      'graduation background',
      'professional certificate',
      'achievement background',
      'honor certificate',
      'recognition background'
    ];

    // Randomly select a query for variety
    const randomQuery = certificateQueries[Math.floor(Math.random() * certificateQueries.length)];
    
    return this.searchImages(randomQuery, 1, 12);
  }

  /**
   * Get business/professional images
   */
  static async getBusinessImages(): Promise<PexelsSearchResponse> {
    return this.searchImages('business professional', 1, 12);
  }

  /**
   * Get celebration/event images
   */
  static async getCelebrationImages(): Promise<PexelsSearchResponse> {
    return this.searchImages('celebration event', 1, 12);
  }

  /**
   * Get nature/abstract images for backgrounds
   */
  static async getBackgroundImages(): Promise<PexelsSearchResponse> {
    return this.searchImages('abstract background', 1, 12);
  }
}
