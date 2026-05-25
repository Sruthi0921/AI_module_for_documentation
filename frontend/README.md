# AI Document Intelligence System
Dynamic Document Storage and AI-Powered Field Extraction

---

## Overview

This project is an AI-powered document intelligence platform capable of reading, understanding, and structuring any uploaded document without predefined schemas.

The system automatically extracts raw text, identifies document type, dynamically creates database tables, and stores extracted fields in a structured, human-readable format. It also provides an intelligent chatbot for document and general queries.

---

## Key Features

- Fast document upload with non-blocking AI processing
- Supports PDF, Word, Excel, CSV, and Image files
- AI-driven document type detection
- Automatic database table creation
- Dynamic field extraction and storage
- Same document type stored in the same table
- New document types create new tables automatically
- Chatbot with document-aware and admin-aware modes
- Production-ready architecture

---

## High-Level Workflow

User uploads document  
Raw text is extracted  
Raw data is stored in database  
AI runs asynchronously  
AI detects document type  
AI extracts structured fields  
Dynamic table is created or reused  
Data is stored in structured form  

---

## Architecture

### Frontend
- React-based UI
- Document upload interface
- Chatbot interface for users and admins

### Backend
- Node.js with Express
- REST APIs
- Asynchronous AI execution
- Dynamic SQL schema handling

### AI Layer
- Large Language Model (Ollama)
- Document understanding and extraction
- Semantic reasoning and field identification

(3 modes : user_document , general chat, admin chat)


### Database
- SQL Server
- Dynamic schema creation
- Raw and structured storage

---

## Database Design

### raw_documents Table

Stores all uploaded documents and extracted raw text.

Fields:
- id
- file_name
- file_type
- file_path
- raw_text
- extracted
- extraction_status
- document_type
- confidence
- embedding
- uploaded_at

Purpose:
- Acts as the source of truth
- Enables reprocessing and auditing
- Keeps uploads fast and reliable

---

### Dynamic Document Tables

Tables are created automatically per document type.

Examples:
- documents_aadhaar
- documents_pan
- documents_resume
- documents_invoice

Common structure:
- id
- raw_document_id
- dynamically extracted fields
- created_at

Rules:
- Same document type is stored in the same table
- New document types generate new tables automatically

---

### chat_history Table

Stores chatbot interactions.

Fields:
- id
- user_id
- mode
- question
- answer
- created_at

---

## Document Upload Flow

Document upload is intentionally fast and non-blocking.

Steps:
1. File is uploaded
2. Raw text is extracted
3. Entry is inserted into raw_documents
4. Immediate response is sent to frontend
5. AI extraction runs asynchronously

This ensures good user experience without UI delays.

---

## AI Document Extraction

The AI engine performs the following tasks:
- Detects document type
- Determines table name
- Extracts meaningful fields
- Separates similar data correctly (e.g., Aadhaar vs VID)
- Returns strict JSON output

Example AI Output:

```json
{
  "document_type": "aadhaar",
  "table_key": "aadhaar",
  "confidence": 0.96,
  "fields": [
    { "name": "aadhaar_number", "value": "123412341234" },
    { "name": "vid", "value": "1234567890123456" },
    { "name": "name", "value": "Rahul Kumar" },
    { "name": "dob", "value": "1999-02-14" }
  ]
}
