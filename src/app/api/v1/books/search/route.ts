import { type NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { BookService } from '@/services/books.service';
import { logger } from '@/lib/logger';
import { ErrorCode, type ApiResponse } from '@/types/api';

/**
 * GET /api/v1/books/search?q={query}
 * Proxies Open Library search. Publicly accessible.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: ErrorCode.VALIDATION_ERROR, message: 'Missing query parameter "q"' },
        },
        { status: 400 }
      );
    }

    const books = await BookService.searchOpenLibrary(query.trim());

    return NextResponse.json<ApiResponse<typeof books>>({
      success: true,
      data: books,
      meta: { total: books.length },
    });
  } catch (error) {
    logger.error({ err: error }, '/api/v1/books/search failed');
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Internal Server Error' },
      },
      { status: 500 }
    );
  }
}
