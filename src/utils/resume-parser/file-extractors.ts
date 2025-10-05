// This file handles extracting text from different file formats
// We support PDF, DOCX, DOC, TXT, RTF, and ODT files

import PDFParser from 'pdf2json';
import mammoth from 'mammoth';

// Main function that figures out what type of file we're dealing with and extracts the text
export async function extractTextFromFile(file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  try {
    switch (fileExtension) {
      case 'pdf':
        return await extractFromPDF(file);
      
      case 'docx':
      case 'doc':
        return await extractFromDOCX(file);
      
      case 'txt':
        return await extractFromTXT(file);
      
      case 'rtf':
        return await extractFromRTF(file);
      
      case 'odt':
        return await extractFromODT(file);
      
      default:
        throw new Error(`Unsupported file format: ${fileExtension}`);
    }
  } catch (error) {
    console.error(`Error extracting text from ${fileExtension}:`, error);
    throw error;
  }
}

// Extract text from PDF files
async function extractFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return new Promise((resolve, reject) => {
      const pdfParser = new (PDFParser as any)(null, 1);
      
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new Error(errData.parserError));
      });
      
      pdfParser.on('pdfParser_dataReady', () => {
        try {
          const rawText = (pdfParser as any).getRawTextContent();
          
          // Check if we got meaningful text
          if (!rawText || rawText.trim().length < 100) {
            reject(new Error('PDF appears to be scanned or image-based. OCR support is currently disabled.'));
            return;
          }
          
          resolve(rawText);
        } catch (err) {
          reject(err);
        }
      });
      
      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    console.error('PDF extraction error:', error);
    if (error instanceof Error && error.message.includes('OCR')) {
      throw error;
    }
    throw new Error('Failed to extract text from PDF. The file may be corrupted or password-protected.');
  }
}

// Extract text from Word documents (DOCX/DOC)
async function extractFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages.length > 0) {
      console.warn('DOCX extraction warnings:', result.messages);
    }
    
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from Word document');
  }
}

// Just read the text file directly - easiest one!
async function extractFromTXT(file: File): Promise<string> {
  try {
    return await file.text();
  } catch (error) {
    console.error('TXT extraction error:', error);
    throw new Error('Failed to read text file');
  }
}

// RTF files need some special handling to strip out the formatting codes
async function extractFromRTF(file: File): Promise<string> {
  try {
    const text = await file.text();
    
    // Clean up RTF formatting - remove all those weird control codes
    // This is a basic conversion, but works for most resumes
    let plainText = text
      .replace(/\\[a-z]+(-?\d+)?[ ]?/g, '') // Remove control words
      .replace(/[{}]/g, '') // Remove braces
      .replace(/\\\\/g, '\\') // Unescape backslashes
      .replace(/\\'/g, "'") // Unescape quotes
      .trim();
    
    return plainText;
  } catch (error) {
    console.error('RTF extraction error:', error);
    throw new Error('Failed to extract text from RTF file');
  }
}

// ODT files (LibreOffice/OpenOffice) - mammoth has limited support but it works
async function extractFromODT(file: File): Promise<string> {
  try {
    // mammoth can handle ODT files, though not as well as DOCX
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('ODT extraction error:', error);
    throw new Error('Failed to extract text from ODT file. Try converting to PDF or DOCX.');
  }
}

// Security check - verify the file is actually what it claims to be by checking its content
export async function detectFileType(file: File): Promise<string | null> {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer).slice(0, 4);
    
    // PDF: %PDF
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return 'application/pdf';
    }
    
    // DOCX/ODT: ZIP (PK)
    if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    // RTF: {\\rtf
    if (bytes[0] === 0x7B && bytes[1] === 0x5C && bytes[2] === 0x72 && bytes[3] === 0x74) {
      return 'application/rtf';
    }
    
    return null;
  } catch (error) {
    console.error('File type detection error:', error);
    return null;
  }
}
