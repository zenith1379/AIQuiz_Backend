import { AIService } from '../services/index.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import xlsx from 'xlsx';
import fs from 'fs/promises';

export class DocumentController {
  // Process uploaded document and extract text
  static async processDocument(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { mimetype, path: filePath, originalname } = req.file;
      let extractedText = '';

      try {
        // Extract text based on file type
        if (mimetype === 'application/pdf') {
          const dataBuffer = await fs.readFile(filePath);
          const pdfData = await pdfParse(dataBuffer);
          extractedText = pdfData.text;
        } else if (mimetype === 'text/plain') {
          extractedText = await fs.readFile(filePath, 'utf-8');
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                   mimetype === 'application/msword') {
          // Word document
          const buffer = await fs.readFile(filePath);
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   mimetype === 'application/vnd.ms-excel') {
          // Excel file
          const workbook = xlsx.readFile(filePath);
          const sheets = workbook.SheetNames;
          extractedText = sheets.map(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            return xlsx.utils.sheet_to_txt(sheet);
          }).join('\n\n');
        } else {
          return res.status(400).json({ error: 'Unsupported file type. Supported: PDF, TXT, DOCX, XLSX' });
        }

        // Clean up uploaded file
        await fs.unlink(filePath).catch(() => {});

        if (!extractedText || !extractedText.trim()) {
          return res.status(400).json({ error: 'No text could be extracted from the document' });
        }

        // Limit text length
        const limitedText = extractedText.substring(0, 10000);

        res.json({
          text: limitedText,
          originalLength: extractedText.length,
          filename: originalname
        });

      } catch (parseError) {
        // Clean up file on error
        await fs.unlink(filePath).catch(() => {});
        throw parseError;
      }

    } catch (err) {
      console.error('Document processing error:', err);
      return res.status(500).json({ error: `Failed to process document: ${err.message}` });
    }
  }

  // Extract topics from text using AI
  static async extractTopics(req, res, next) {
    try {
      const { text } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Text is required' });
      }

      // Limit text length to avoid token overflow
      const limitedText = text.substring(0, 5000);

      const topics = await AIService.extractTopicsFromText(limitedText);

      res.json({
        topics: topics || []
      });
    } catch (err) {
      console.error('Topic extraction error:', err);
      next(err);
    }
  }

  // Generate questions from topics and source text
  static async generateQuestionsFromTopics(req, res, next) {
    try {
      const { topics, sourceText, questionCount = 10 } = req.body;

      if (!topics || !Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({ error: 'Topics array is required' });
      }

      const count = Math.min(questionCount, 50); // Limit to 50 questions max

      // Generate questions for the selected topics
      const questions = await AIService.generateQuestionsFromTopics(
        topics,
        sourceText,
        count
      );

      res.json({
        questions: questions || []
      });
    } catch (err) {
      console.error('Question generation from topics error:', err);
      next(err);
    }
  }
}
