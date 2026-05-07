# Complete API Reference Documentation

This document contains a comprehensive breakdown of all API endpoints in the Job Interview Platform Backend, including their HTTP methods, required fields, purpose, and standard responses.

## Standard Response Format
All successful responses follow this format:
```json
{
  "status": "success",
  "code": 200,
  "data": { ... },
  "message": "Operation successful"
}
```

---

## 1. Authentication & Users

### 1.1 Register User
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/register`
*   **Purpose**: Creates a new user (recruiter/employer) and sends a verification email.
*   **Body Fields**: `full_name` (str), `email` (str), `password` (str), `employer_id` (uuid), `role` (str: user/admin)
*   **Response**: `201 Created` with user details (excluding password).

### 1.2 Login
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/login`
*   **Purpose**: Authenticate user and get JWT token.
*   **Body Fields**: `email` (str), `password` (str)
*   **Response**: `200 OK` with `access_token` and `user` object.

### 1.3 Verify Account
*   **Method**: `GET`
*   **Endpoint**: `/api/auth/verify/{token}`
*   **Purpose**: Validates the email token.
*   **Response**: `200 OK` "Account verified successfully."

### 1.4 Get Current User
*   **Method**: `GET`
*   **Endpoint**: `/api/users/{id}`
*   **Purpose**: Retrieves a specific user profile.
*   **Headers**: `Authorization: Bearer <token>`
*   **Response**: `200 OK` with user data.

---

## 2. Employers (Companies)

### 2.1 Create Employer
*   **Method**: `POST`
*   **Endpoint**: `/api/employers`
*   **Purpose**: Register a new company.
*   **Body Fields**: `company_name` (str), `website` (str), `contact_email` (str)
*   **Response**: `201 Created` with employer details.

### 2.2 Get Employer Details
*   **Method**: `GET`
*   **Endpoint**: `/api/employers/{id}`
*   **Purpose**: Fetch company information.

---

## 3. Jobs

### 3.1 Create Job
*   **Method**: `POST`
*   **Endpoint**: `/api/jobs`
*   **Purpose**: Post a new job opening.
*   **Body Fields**: `employer_id` (uuid), `title` (str), `department` (str), `job_description` (str), `experience_min` (int), `experience_max` (int), `skills` (list of str), `status` (str)
*   **Response**: `201 Created` with job details.

### 3.2 List Jobs
*   **Method**: `GET`
*   **Endpoint**: `/api/jobs`
*   **Query Params**: `limit`, `offset`, `employer_id`
*   **Purpose**: Retrieve a paginated list of jobs.

### 3.3 Get Job Applications
*   **Method**: `GET`
*   **Endpoint**: `/api/jobs/{id}/applications`
*   **Purpose**: See all candidates who applied for this specific job.

---

## 4. Candidates

### 4.1 Register Candidate Profile
*   **Method**: `POST`
*   **Endpoint**: `/api/candidates`
*   **Purpose**: Create a profile for an applicant.
*   **Body Fields**: `full_name` (str), `email` (str), `mobile` (str), `linkedin_url` (str), `github_url` (str)
*   **Response**: `201 Created` with candidate UUID.

### 4.2 Get Candidate Profile
*   **Method**: `GET`
*   **Endpoint**: `/api/candidates/{id}`
*   **Purpose**: Fetch applicant data.

---

## 5. Resumes

### 5.1 Upload Resume
*   **Method**: `POST`
*   **Endpoint**: `/api/candidates/{id}/resumes`
*   **Purpose**: Attach a resume file to a candidate.
*   **Body Fields**: `file_url` (str), `file_name` (str)

### 5.2 Parse Resume (AI Extraction)
*   **Method**: `POST`
*   **Endpoint**: `/api/resumes/{id}/parse`
*   **Purpose**: Trigger AI to read the resume and extract structured data.
*   **Response**: Updates `parsed` to True.

### 5.3 Get Extracted Data
*   **Method**: `GET`
*   **Endpoint**: `/api/resumes/{id}/extracted-data`
*   **Purpose**: Fetch the JSON skills, education, and experience parsed from the PDF.

---

## 6. Job Applications

### 6.1 Apply for Job
*   **Method**: `POST`
*   **Endpoint**: `/api/applications`
*   **Purpose**: Link a candidate to a job.
*   **Body Fields**: `candidate_id` (uuid), `job_id` (uuid), `source` (str), `application_status` (str)

### 6.2 Update Application Status
*   **Method**: `PATCH`
*   **Endpoint**: `/api/applications/{id}/status`
*   **Purpose**: Move candidate through pipeline (e.g., APPLIED -> INTERVIEWING -> HIRED).
*   **Body Fields**: `status` (str)

---

## 7. Interview Sessions

### 7.1 Create Interview
*   **Method**: `POST`
*   **Endpoint**: `/api/interview-sessions`
*   **Purpose**: Initialize a new AI interview for an application.
*   **Body Fields**: `application_id` (uuid), `interview_type` (str)

### 7.2 Start / End Interview
*   **Method**: `PATCH`
*   **Endpoints**: 
  - `/api/interview-sessions/{id}/start`
  - `/api/interview-sessions/{id}/end`
*   **Purpose**: Timestamp and trigger the start/end of the live session.

---

## 8. Interview Questions & Answers

### 8.1 Add Question
*   **Method**: `POST`
*   **Endpoint**: `/api/interview-sessions/{id}/questions`
*   **Purpose**: Add an AI-generated question to the session.
*   **Body Fields**: `question` (str), `category` (str), `difficulty` (str)

### 8.2 Fetch Session Questions
*   **Method**: `GET`
*   **Endpoint**: `/api/interview-sessions/{id}/questions`
*   **Purpose**: Get all questions the candidate needs to answer.

### 8.3 Submit Answer
*   **Method**: `POST`
*   **Endpoint**: `/api/interview-questions/{id}/answers`
*   **Purpose**: Record candidate's response.
*   **Body Fields**: `answer_text` (str), `audio_url` (str), `video_url` (str), `transcription` (str)

---

## 9. AI Reports

### 9.1 Generate Report
*   **Method**: `POST`
*   **Endpoint**: `/api/interview-sessions/{id}/generate-report`
*   **Purpose**: Triggers AI evaluation of all answers submitted in the session.

### 9.2 Fetch AI Report
*   **Method**: `GET`
*   **Endpoint**: `/api/interview-sessions/{id}/report`
*   **Purpose**: Get the final grading.
*   **Response Data**:
    ```json
    {
      "skill_match_score": 85.5,
      "communication_rating": 90.0,
      "technical_rating": 80.0,
      "culture_fit_rating": 95.0,
      "strengths": ["React Native", "API Design"],
      "weaknesses": ["Database Indexing"],
      "final_recommendation": "Strong Hire",
      "detailed_feedback": "Excellent communication..."
    }
    ```
