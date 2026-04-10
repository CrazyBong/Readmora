import { type NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { BookService } from '@/services/books.service';
import { ErrorCode, type ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    if (!genre || genre.trim().length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: ErrorCode.VALIDATION_ERROR, message: 'Missing query parameter "genre"' },
        },
        { status: 400 }
      );
    }

    const parsedPage = pageParam ? Number.parseInt(pageParam, 10) : 1;
    const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 24;
    const normalizedPage = Number.isNaN(parsedPage) ? 1 : parsedPage;
    const normalizedLimit = Number.isNaN(parsedLimit) ? 24 : parsedLimit;

    if (normalizedPage < 1) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Query parameter "page" must be at least 1',
          },
        },
        { status: 400 }
      );
    }

    if (normalizedLimit < 1) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Query parameter "limit" must be at least 1',
          },
        },
        { status: 400 }
      );
    }

    const books = await BookService.discoverBySubject(
      genre.trim(),
      normalizedPage,
      normalizedLimit
    );

    return NextResponse.json<ApiResponse<typeof books>>({
      success: true,
      data: books,
      meta: { returned: books.length, page: normalizedPage, limit: normalizedLimit },
    });
  } catch (error) {
    logger.error({ err: error }, '/api/v1/books/discover failed');
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Internal Server Error' },
      },
      { status: 500 }
    );
  }
}
