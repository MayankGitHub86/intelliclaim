# IntelliClaim Backend API Structure

## Overview
This document outlines the complete backend API structure that integrates with your existing frontend components.

## API Endpoints Structure

### 1. Authentication & User Management
```
POST   /api/v1/auth/register        - User registration
POST   /api/v1/auth/login           - User login
POST   /api/v1/auth/logout          - User logout
POST   /api/v1/auth/refresh         - Refresh JWT token
GET    /api/v1/auth/me              - Get current user info
PUT    /api/v1/auth/profile         - Update user profile
```

### 2. Dashboard Analytics
```
GET    /api/v1/dashboard/metrics    - Real-time dashboard metrics
GET    /api/v1/dashboard/stats      - Processing statistics
GET    /api/v1/dashboard/recent     - Recent activity feed
GET    /api/v1/dashboard/charts     - Chart data for analytics
```

### 3. Document Processing
```
POST   /api/v1/documents/upload     - Upload documents for processing
POST   /api/v1/documents/analyze    - AI analysis of documents
GET    /api/v1/documents/           - List all documents
GET    /api/v1/documents/{id}       - Get specific document
PUT    /api/v1/documents/{id}       - Update document
DELETE /api/v1/documents/{id}       - Delete document
POST   /api/v1/documents/query      - Natural language query processing
```

### 4. Claims Management
```
GET    /api/v1/claims/              - List all claims
POST   /api/v1/claims/              - Create new claim
GET    /api/v1/claims/{id}          - Get specific claim
PUT    /api/v1/claims/{id}          - Update claim
DELETE /api/v1/claims/{id}          - Delete claim
POST   /api/v1/claims/{id}/approve  - Approve claim
POST   /api/v1/claims/{id}/reject   - Reject claim
GET    /api/v1/claims/{id}/history  - Claim processing history
```

### 5. Vision Inspector
```
POST   /api/v1/vision/analyze       - Computer vision analysis
POST   /api/v1/vision/upload        - Upload image for analysis
GET    /api/v1/vision/detections/{id} - Get detection results
POST   /api/v1/vision/ocr           - OCR text extraction
POST   /api/v1/vision/classify      - Image classification
```

### 6. Workflow Builder
```
GET    /api/v1/workflows/           - List all workflows
POST   /api/v1/workflows/           - Create new workflow
GET    /api/v1/workflows/{id}       - Get specific workflow
PUT    /api/v1/workflows/{id}       - Update workflow
DELETE /api/v1/workflows/{id}       - Delete workflow
POST   /api/v1/workflows/{id}/execute - Execute workflow
GET    /api/v1/workflows/templates  - Get workflow templates
```

### 7. Settings & Configuration
```
GET    /api/v1/settings/profile     - Get user profile settings
PUT    /api/v1/settings/profile     - Update profile settings
GET    /api/v1/settings/notifications - Get notification preferences
PUT    /api/v1/settings/notifications - Update notifications
GET    /api/v1/settings/ai          - Get AI processing settings
PUT    /api/v1/settings/ai          - Update AI settings
GET    /api/v1/settings/api         - Get API configuration
PUT    /api/v1/settings/api         - Update API settings
```

### 8. System & Health
```
GET    /health                      - Health check
GET    /api/v1/system/status        - System status
GET    /api/v1/system/logs          - System logs
GET    /api/v1/system/metrics       - System metrics
```

## Frontend Component Integration Map

### 1. Auth Component → Authentication API
- **Login Form** → `POST /api/v1/auth/login`
- **Register Form** → `POST /api/v1/auth/register`
- **Profile Management** → `GET/PUT /api/v1/auth/profile`

### 2. Dashboard Component → Dashboard & Claims APIs
- **Metrics Cards** → `GET /api/v1/dashboard/metrics`
- **Processing Stats** → `GET /api/v1/dashboard/stats`
- **Recent Activity** → `GET /api/v1/dashboard/recent`
- **Chart Data** → `GET /api/v1/dashboard/charts`

### 3. Document Processor → Documents & Claims APIs
- **File Upload** → `POST /api/v1/documents/upload`
- **AI Analysis** → `POST /api/v1/documents/analyze`
- **Natural Language Query** → `POST /api/v1/documents/query`
- **Results Display** → `GET /api/v1/claims/{id}`

### 4. Vision Inspector → Vision API
- **Image Upload** → `POST /api/v1/vision/upload`
- **Analysis Processing** → `POST /api/v1/vision/analyze`
- **Object Detection** → `GET /api/v1/vision/detections/{id}`
- **OCR Processing** → `POST /api/v1/vision/ocr`

### 5. Workflow Builder → Workflows API
- **Load Workflows** → `GET /api/v1/workflows/`
- **Save Workflow** → `POST /api/v1/workflows/`
- **Execute Workflow** → `POST /api/v1/workflows/{id}/execute`
- **Templates** → `GET /api/v1/workflows/templates`

### 6. Settings Component → Settings API
- **Profile Settings** → `GET/PUT /api/v1/settings/profile`
- **Notifications** → `GET/PUT /api/v1/settings/notifications`
- **AI Configuration** → `GET/PUT /api/v1/settings/ai`
- **API Settings** → `GET/PUT /api/v1/settings/api`

## Database Schema

### Users Table
```sql
- id (UUID, Primary Key)
- email (String, Unique)
- password_hash (String)
- name (String)
- company (String)
- role (String)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Claims Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- title (String)
- description (Text)
- status (Enum: pending, approved, rejected, review)
- amount (Decimal)
- confidence_score (Float)
- ai_decision (Text)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Documents Table
```sql
- id (UUID, Primary Key)
- claim_id (UUID, Foreign Key)
- filename (String)
- file_path (String)
- file_type (String)
- file_size (Integer)
- analysis_results (JSON)
- created_at (Timestamp)
```

### Workflows Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- name (String)
- description (Text)
- nodes (JSON)
- connections (JSON)
- is_active (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Vision_Analyses Table
```sql
- id (UUID, Primary Key)
- document_id (UUID, Foreign Key)
- image_path (String)
- detections (JSON)
- confidence_scores (JSON)
- processing_time (Float)
- created_at (Timestamp)
```

## AI Services Integration

### OpenAI Integration
- **Document Analysis**: GPT-4 for claim decision making
- **Natural Language Processing**: Query understanding
- **Text Generation**: Justification and reports

### Pinecone Integration
- **Document Similarity**: Vector search for similar claims
- **Knowledge Base**: Policy and procedure lookup
- **Smart Matching**: Automatic categorization

### HuggingFace Integration
- **Computer Vision**: Object detection and classification
- **OCR Processing**: Text extraction from images
- **Document Understanding**: Layout analysis

## Security Implementation

### Authentication
- JWT tokens with refresh mechanism
- Password hashing with bcrypt
- Session management with Redis

### Authorization
- Role-based access control (RBAC)
- API key management
- Rate limiting per user/endpoint

### Data Protection
- File encryption for uploaded documents
- Database encryption at rest
- HTTPS/TLS for all communications

## Real-time Features

### WebSocket Connections
- Live processing updates
- Real-time dashboard metrics
- Instant notifications

### Background Processing
- Celery for async tasks
- Redis for job queuing
- Progress tracking

## Implementation Priority

1. **Phase 1**: Authentication + Basic APIs
2. **Phase 2**: Document Processing + Claims
3. **Phase 3**: Vision Inspector + AI Integration
4. **Phase 4**: Dashboard Analytics + Real-time
5. **Phase 5**: Workflow Builder + Advanced Features
6. **Phase 6**: Settings + System Management

This structure ensures your existing frontend components will seamlessly integrate with the backend services!
