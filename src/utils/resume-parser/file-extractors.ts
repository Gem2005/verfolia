// This file handles extracting text from different file formats
// We support PDF, DOCX, DOC, TXT, RTF, and ODT files

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

// Set up the PDF worker for client-side PDF parsing
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

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

// Extract text from PDF files - this handles both regular PDFs and scanned ones
async function extractFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Go through each page and extract the text
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    // If we barely got any text, the PDF might be scanned - let's try OCR
    if (fullText.trim().length < 100) {
      console.log('PDF appears to be scanned, attempting OCR...');
      fullText = await performOCR(file);
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    // If regular extraction fails, try OCR as a backup
    return await performOCR(file);
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

// Use OCR (Optical Character Recognition) for scanned documents or when text extraction fails
async function performOCR(file: File): Promise<string> {
  try {
    console.log('Starting OCR process...');
    const { data: { text } } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text using OCR');
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
