import { NextRequest, NextResponse } from 'next/server';
import { PexelsService } from '@/lib/pexels-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');
    const category = searchParams.get('category') || '';

    let response;

    switch (category) {
      case 'certificates':
        response = await PexelsService.getCertificateTemplates();
        break;
      case 'business':
        response = await PexelsService.getBusinessImages();
        break;
      case 'celebration':
        response = await PexelsService.getCelebrationImages();
        break;
      case 'backgrounds':
        response = await PexelsService.getBackgroundImages();
        break;
      case 'curated':
        response = await PexelsService.getCuratedImages(page, perPage);
        break;
      default:
        if (query) {
          response = await PexelsService.searchImages(query, page, perPage);
        } else {
          response = await PexelsService.getCuratedImages(page, perPage);
        }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Pexels API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
