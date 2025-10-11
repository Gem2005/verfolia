import { NextRequest, NextResponse } from 'next/server';
import { parseResumeWithAI, validateAIResumeData, AIResumeData } from '@/services/ai-resume-parser';
import { formatAIResumeForAPI } from '@/utils/ai-resume-transformer';

export const runtime = 'nodejs';

const CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.doc'],
} as const;

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ParsingError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'ParsingError';
  }
}

function validateFile(file: File): void {
  if (file.size > CONFIG.MAX_FILE_SIZE) {
    throw new ValidationError(
      'File size exceeds maximum allowed size of 10MB'
    );
  }

  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!extension || !CONFIG.ALLOWED_EXTENSIONS.includes(extension as '.pdf' | '.docx' | '.doc')) {
    throw new ValidationError(
      'File type not supported. Allowed types: .pdf, .docx, .doc'
    );
  }
}

function getFileExtension(filename: string): string {
  return filename.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const formData = await request.formData();
    const fileData = formData.get('file');

    if (!fileData || !(fileData instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded', error_type: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    try {
      validateFile(fileData);
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { success: false, error: error.message, error_type: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      throw error;
    }

    console.log(`[AI Parse] Parsing: ${fileData.name} (${fileData.size} bytes)`);

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileType = getFileExtension(fileData.name).replace('.', '') as 'pdf' | 'docx' | 'doc';

    let aiParsed: { data: AIResumeData; warnings: string[] };
    try {
      const rawData = await parseResumeWithAI(buffer, fileType);
      aiParsed = validateAIResumeData(rawData);
    } catch (error) {
      console.error('[AI Parse] Failed:', error);
      throw new ParsingError(
        error instanceof Error ? error.message : 'Failed to parse resume with AI',
        error
      );
    }

    const response = {
      success: true,
      data: {
        filename: fileData.name,
        file_type: fileType,
        file_size: fileData.size,
        parsed_resume: formatAIResumeForAPI(aiParsed.data),
        editor_markdown: '',
        warnings: aiParsed.warnings || [],
        metadata: {
          parsed_at: new Date().toISOString(),
          processing_time_ms: Date.now() - startTime,
          parser: 'gemini-2.5-flash-lite',
        },
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[AI Parse] Unexpected error:', error);

    if (error instanceof ParsingError) {
      return NextResponse.json(
        { success: false, error: error.message, error_type: 'PARSING_ERROR' },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred', error_type: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
