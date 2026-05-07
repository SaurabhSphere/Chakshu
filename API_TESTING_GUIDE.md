# API Testing Guide

Complete guide to test all 50+ endpoints manually using curl, Postman, or HTTPie.

---

## Quick Start

### 1. Start the Server

```bash
python -m uvicorn main:app --reload
```

Server runs at: `http://127.0.0.1:8000`

### 2. View API Documentation

Open browser: http://127.0.0.1:8000/docs

Interactive Swagger UI showing all endpoints with try-it-out feature.

### 3. Run Python Test Script

```bash
python test_api.py
```

Automated test of key endpoints.

---

## Using curl

### Authentication Flow

#### 1. Register a User

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "employer_id": "emp-uuid-here",
    "role": "user"
  }'
```

**Response**:
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "user-uuid",
    "employer_id": "emp-uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2026-05-07T..."
  },
  "message": "User registered successfully"
}
```

#### 2. Login and Get Token

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Response**:
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {...}
  },
  "message": "Login successful"
}
```

Copy the `access_token` value.

#### 3. Save Token to Variable (Linux/Mac)

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Or from login response:

```bash
TOKEN=$(curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securepassword123"}' \
  | jq -r '.data.access_token')
```

#### 4. Use Token in Authenticated Requests

```bash
curl -X GET http://127.0.0.1:8000/api/users/user-id \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing Employers

### Create Employer

```bash
curl -X POST http://127.0.0.1:8000/api/employers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Tech Corp",
    "website": "https://techcorp.com",
    "contact_email": "hr@techcorp.com"
  }'
```

Save the returned `id`.

### List Employers (Paginated)

```bash
curl -X GET "http://127.0.0.1:8000/api/employers?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Specific Employer

```bash
curl -X GET http://127.0.0.1:8000/api/employers/employer-id \
  -H "Authorization: Bearer $TOKEN"
```

### Update Employer

```bash
curl -X PUT http://127.0.0.1:8000/api/employers/employer-id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Tech Corp Updated"
  }'
```

### Delete Employer

```bash
curl -X DELETE http://127.0.0.1:8000/api/employers/employer-id \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing Jobs

### Create Job

```bash
EMPLOYER_ID="employer-uuid-here"

curl -X POST http://127.0.0.1:8000/api/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employer_id": "'$EMPLOYER_ID'",
    "title": "Senior Python Developer",
    "department": "Engineering",
    "job_description": "Looking for an experienced Python developer with 3+ years experience in FastAPI",
    "experience_min": 3,
    "experience_max": 8,
    "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
    "status": "active"
  }'
```

### List Jobs with Filter

```bash
# All jobs
curl -X GET "http://127.0.0.1:8000/api/jobs?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"

# Filter by employer
curl -X GET "http://127.0.0.1:8000/api/jobs?employer_id=employer-id&status=active" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Job Applications

```bash
curl -X GET http://127.0.0.1:8000/api/jobs/job-id/applications \
  -H "Authorization: Bearer $TOKEN"
```

### Update Job Status

```bash
curl -X PATCH http://127.0.0.1:8000/api/jobs/job-id/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "closed"}'
```

---

## Testing Candidates

### Register Candidate (No Auth Required)

```bash
curl -X POST http://127.0.0.1:8000/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "mobile": "+1-555-0123",
    "linkedin_url": "https://linkedin.com/in/janesmith",
    "github_url": "https://github.com/janesmith"
  }'
```

Save the returned `id`.

### List Candidates

```bash
curl -X GET "http://127.0.0.1:8000/api/candidates?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Candidate Applications

```bash
curl -X GET http://127.0.0.1:8000/api/candidates/candidate-id/applications \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing Job Applications

### Apply for Job

```bash
JOB_ID="job-uuid-here"
CANDIDATE_ID="candidate-uuid-here"

curl -X POST http://127.0.0.1:8000/api/applications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_id": "'$CANDIDATE_ID'",
    "job_id": "'$JOB_ID'",
    "source": "web"
  }'
```

Save the returned `id`.

### Update Application Status

```bash
curl -X PATCH http://127.0.0.1:8000/api/applications/app-id/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_status": "shortlisted"}'
```

Valid statuses: `applied`, `rejected`, `shortlisted`, `interview`, `offered`, `hired`

### List Applications with Filter

```bash
# All applications
curl -X GET "http://127.0.0.1:8000/api/applications?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl -X GET "http://127.0.0.1:8000/api/applications?status=shortlisted" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing Resumes

### Upload Resume

```bash
CANDIDATE_ID="candidate-uuid-here"

curl -X POST http://127.0.0.1:8000/api/candidates/$CANDIDATE_ID/resumes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file_url": "https://storage.example.com/resumes/jane-smith.pdf",
    "file_name": "jane-smith.pdf",
    "parsed": false
  }'
```

### List Resumes for Candidate

```bash
curl -X GET "http://127.0.0.1:8000/api/candidates/$CANDIDATE_ID/resumes?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

### Parse Resume

```bash
curl -X POST http://127.0.0.1:8000/api/resumes/resume-id/parse \
  -H "Authorization: Bearer $TOKEN"
```

### Extract Resume Data

```bash
curl -X POST http://127.0.0.1:8000/api/resumes/resume-id/extracted-data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Experienced software engineer with 5 years in full-stack development",
    "total_experience": 5.5,
    "skills": ["Python", "JavaScript", "React", "FastAPI", "PostgreSQL"],
    "education": [
      {
        "degree": "B.S. Computer Science",
        "college": "State University",
        "year": 2018
      }
    ],
    "companies_worked": ["Tech Corp", "StartUp Inc"]
  }'
```

### Get Extracted Data

```bash
curl -X GET http://127.0.0.1:8000/api/resumes/resume-id/extracted-data \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing Interview Sessions

### Create Interview Session

```bash
APP_ID="application-uuid-here"

curl -X POST http://127.0.0.1:8000/api/interview-sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": "'$APP_ID'",
    "interview_type": "technical",
    "status": "pending"
  }'
```

Save the returned `id`.

### Start Interview

```bash
curl -X PATCH http://127.0.0.1:8000/api/interview-sessions/session-id/start \
  -H "Authorization: Bearer $TOKEN"
```

### End Interview

```bash
curl -X PATCH http://127.0.0.1:8000/api/interview-sessions/session-id/end \
  -H "Authorization: Bearer $TOKEN"
```

### Update Session with Scores

```bash
curl -X PUT http://127.0.0.1:8000/api/interview-sessions/session-id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "overall_score": 8.5,
    "recommendation": "strong_yes",
    "ai_summary": "Candidate demonstrated excellent technical knowledge and communication skills"
  }'
```

---

## Testing Interview Questions & Answers

### Add Interview Question

```bash
SESSION_ID="session-uuid-here"

curl -X POST http://127.0.0.1:8000/api/interview-sessions/$SESSION_ID/questions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Tell me about your experience with FastAPI",
    "category": "technical",
    "difficulty": "medium",
    "generated_by_ai": true
  }'
```

Save the returned `id`.

### List Questions in Session

```bash
curl -X GET "http://127.0.0.1:8000/api/interview-sessions/$SESSION_ID/questions?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

### Submit Answer

```bash
QUESTION_ID="question-uuid-here"

curl -X POST http://127.0.0.1:8000/api/interview-questions/$QUESTION_ID/answers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answer_text": "I have 3 years of experience with FastAPI, building REST APIs and async applications",
    "audio_url": "https://storage.example.com/audio/answer-1.wav"
  }'
```

Save the returned `id`.

### Score Answer

```bash
ANSWER_ID="answer-uuid-here"

curl -X PUT http://127.0.0.1:8000/api/interview-answers/$ANSWER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answer_score": 8.5,
    "confidence_score": 0.92,
    "communication_score": 8.0,
    "technical_score": 9.0
  }'
```

---

## Testing AI Reports

### Generate AI Report

```bash
SESSION_ID="session-uuid-here"

curl -X POST http://127.0.0.1:8000/api/interview-sessions/$SESSION_ID/generate-report \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "strengths": ["Strong technical knowledge", "Good communication"],
    "weaknesses": ["Limited DevOps experience"],
    "skill_match_score": 8.5,
    "communication_rating": 8.0,
    "technical_rating": 9.0,
    "culture_fit_rating": 7.5,
    "final_recommendation": "strong_yes",
    "detailed_feedback": "Excellent candidate with strong technical skills..."
  }'
```

### Get Report for Session

```bash
curl -X GET http://127.0.0.1:8000/api/interview-sessions/$SESSION_ID/report \
  -H "Authorization: Bearer $TOKEN"
```

---

## Using Postman

1. **Import from Swagger**: 
   - Open Postman
   - Click "Import"
   - Paste: `http://127.0.0.1:8000/openapi.json`

2. **Set Environment Variable for Token**:
   - New Environment
   - Add variable: `token` = (paste JWT token)
   - Use in requests: `Authorization: Bearer {{token}}`

3. **Test Each Endpoint**:
   - All endpoints are auto-imported from Swagger
   - Use environment variable for authentication

---

## Using HTTPie

HTTPie is simpler than curl:

```bash
# Register
http POST http://127.0.0.1:8000/api/auth/register \
  full_name="John Doe" \
  email="john@example.com" \
  password="securepassword123" \
  employer_id="emp-uuid" \
  role="user"

# Login
http POST http://127.0.0.1:8000/api/auth/login \
  email="john@example.com" \
  password="securepassword123"

# Authenticated request
http GET http://127.0.0.1:8000/api/users/user-id \
  "Authorization: Bearer $TOKEN"
```

---

## Common Error Responses

### 401 Unauthorized (Missing/Invalid Token)

```json
{
  "status": "error",
  "code": 401,
  "data": null,
  "message": "Not authenticated"
}
```

**Fix**: Include valid JWT in `Authorization: Bearer <token>` header

### 404 Not Found

```json
{
  "status": "error",
  "code": 404,
  "data": null,
  "message": "User with ID 'xyz' not found"
}
```

**Fix**: Use correct resource IDs

### 400 Bad Request (Validation Error)

```json
{
  "status": "error",
  "code": 400,
  "data": {
    "errors": ["email: invalid email format"]
  },
  "message": "Validation error"
}
```

**Fix**: Check request body format and required fields

### 409 Conflict (Duplicate Resource)

```json
{
  "status": "error",
  "code": 409,
  "data": null,
  "message": "User with email 'john@example.com' already exists"
}
```

**Fix**: Use unique values (e.g., different email)

---

## Testing Tips

1. **Save IDs**: Copy UUIDs from responses for follow-up requests
2. **Use Pretty Print**: `| jq` (curl) or `-j` (HTTPie) for readable JSON
3. **Check Response**: Always verify `status` and `code` fields
4. **Test Pagination**: Try `?limit=5&offset=0` on list endpoints
5. **Test Filters**: Use `?status=active` or `?employer_id=...` on filtered endpoints
6. **Test Errors**: Try invalid IDs, wrong passwords, missing tokens

---

## Next Steps

- ✅ Test all CRUD endpoints
- ✅ Verify authentication flow
- ✅ Check pagination & filtering
- ✅ Validate error responses
- 📝 Create integration tests (Phase 5)
- 🔌 Add PostgreSQL database (Phase 6)

