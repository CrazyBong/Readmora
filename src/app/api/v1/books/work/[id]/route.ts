import { NextResponse } from 'next/server';

import { normalizeOpenLibraryWorkId } from '@/lib/books';
import { logger } from '@/lib/logger';
import { BookService } from '@/services/books.service';
import { ErrorCode, type ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const normalizedId = normalizeOpenLibraryWorkId(id);

    if (!normalizedId) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: ErrorCode.VALIDATION_ERROR, message: 'Invalid Open Library work id' },
        },
        { status: 400 }
      );
    }

    const book = await BookService.fetchOpenLibraryWork(normalizedId);
    if (!book) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: ErrorCode.NOT_FOUND, message: 'Book not found in Open Library' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<typeof book>>({
      success: true,
      data: book,
      meta: { work_id: normalizedId },
    });
  } catch (error) {
    logger.error({ err: error }, '/api/v1/books/work/[id] failed');
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Internal Server Error' },
      },
      { status: 500 }
    );
  }
}
