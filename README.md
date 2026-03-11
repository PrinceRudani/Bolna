# Bolna AI Complaint Management System

## Overview

This project is a complaint management system that integrates **voice-based complaint collection**, **AI transcription**, and **department-based complaint tracking**. The system collects complaints through AI calls, stores them in a database, and provides a dashboard to view complaints by department.

The application consists of two main parts:

* **Backend**: Built with Python (FastAPI) and MySQL
* **Frontend**: Built with React (Vite)

The backend communicates with external services for voice AI, telephony, and AI processing.

---

# Project Architecture

```
Frontend (React + Vite)
        |
        |  REST API
        |
Backend (FastAPI)
        |
        |---- MySQL Database
        |---- Voice AI API
        |---- Twilio Telephony API
        |---- AI Processing API
```

---

# Features

* AI-powered voice complaint registration
* Automatic transcription of calls
* Complaint categorization by department
* Department-based filtering
* Dashboard with department complaint counts
* Pagination for large datasets
* API-based communication between frontend and backend

---

# Technologies Used

## Backend

* Python
* FastAPI
* MySQL
* PyMySQL
* REST API

## Frontend

* React
* Vite
* Tailwind CSS
* Axios

## External Services

* Voice AI Service
* Telephony Service
* AI Processing Service

---

# Environment Configuration

Create a `.env` file in the **backend project root**.

## Backend Environment Variables

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bolna

AGENT_ID=your_agent_id

BOLNA_BASE_URL=https://api.bolna.ai/v2
BOLNA_EMAIL=your_email
BOLNA_PASSWORD=your_password
BOLNA_API_KEY=your_api_key

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

GEMINI_API_KEY=your_gemini_api_key
```

---

Create a `.env` file in the **frontend project root**.

## Frontend Environment Variables

```
VITE_BOLNA_TOKEN=your_bolna_token
VITE_AGENT_ID=your_agent_id
```

---

# Installation Guide

## 1. Clone the Repository

```
git clone <repository_url>
cd project-folder
```

---

# Backend Setup

### Install Dependencies

```
pip install -r requirements.txt
```

### Run Backend Server

```
uvicorn app.main:app --reload
```

Server will start at:

```
http://127.0.0.1:8000
```

API documentation will be available at:

```
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Navigate to the frontend directory:

```
cd frontend
```

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

Frontend will start at:

```
http://localhost:5173
```

---

# Key APIs

## Get All AI Summaries

```
GET /ai-summary
```

Returns paginated complaint summaries.

---

## Filter Complaints by Department

```
POST /ai-summary-by-department
```

Payload:

```
{
  "department": "animal",
  "page_number": 1,
  "page_size": 50
}
```

---

## Department Complaint Counts

```
GET /department-counts
```

Example response:

```
[
  {
    "department": "water",
    "total_complaints": 7
  },
  {
    "department": "streetlights",
    "total_complaints": 1
  },
  {
    "department": "animals",
    "total_complaints": 2
  }
]
```

---

# Database Tables

## ai_summary

Stores AI processed complaint data.

Main fields:

* id
* reporter_name
* reporter_phone
* area
* complaint_type
* transcript
* assigned_to
* created_at
* related_execution_id
* inserted_at

---

## call_executions

Stores call status and execution details.

Main fields:

* id
* status
* user_number

---

# Dashboard Workflow

1. Citizen calls the AI complaint system.
2. Call is processed through Voice AI.
3. Complaint is transcribed and categorized.
4. Complaint data is stored in the database.
5. Dashboard fetches complaint summaries via APIs.
6. Departments grid displays complaint counts.

---

# Security Best Practices

* Never commit `.env` files to version control.
* Store all API keys securely.
* Use environment variables for all secrets.

Add `.env` to `.gitignore`.

```
.env
```

---

# Future Improvements

* Role-based authentication
* Real-time complaint updates
* Advanced complaint analytics
* Automatic department detection using AI
* Complaint priority classification

---

# Author

Prince Rudani
