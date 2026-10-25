# 🎯 YRNovatech Task Tracker (Task 5)

A complete, production-ready Full Stack Task Tracker application built with **Django REST Framework**, **HTML5**, **CSS3**, **Vanilla JavaScript (ES6+)**, and **PostgreSQL**.

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Beginner Step-by-Step Setup](#-beginner-step-by-step-setup)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone or Navigate to the Project](#2-clone-or-navigate-to-the-project)
  - [3. Create and Activate a Virtual Environment](#3-create-and-activate-a-virtual-environment)
  - [4. Install Dependencies](#4-install-dependencies)
  - [5. Database Configuration (PostgreSQL & SQLite)](#5-database-configuration-postgresql--sqlite)
  - [6. Apply Database Migrations](#6-apply-database-migrations)
  - [7. Seed Sample Data (Optional)](#7-seed-sample-data-optional)
  - [8. Run the Development Server](#8-run-the-development-server)
- [REST API Reference](#-rest-api-reference)
- [Running Automated Tests](#-running-automated-tests)
- [UI & UX Highlights](#-ui--ux-highlights)
- [License](#-license)

---

## 🌟 Project Overview
This project fulfills all requirements for the **YRNovatech Internship Task 5**. It delivers a clean, responsive single-page task management dashboard that interfaces with a robust RESTful API backend.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **Full CRUD Operations** | Create, view, update, and delete tasks dynamically with clean modal dialogs. |
| **Search & Filtering** | Instant debounced search by title and description; filter by status and priority; multi-field sorting. |
| **Pagination** | Server-side `PageNumberPagination` with page size control and interactive frontend page numbers. |
| **Database Persistence** | Built for **PostgreSQL** with automatic, zero-friction local fallback to **SQLite**. |
| **Form Validation** | Dual-layer validation: client-side checks + DRF serializer validation with inline field error messages. |
| **Loading Indicators** | Skeleton loading cards, button submission spinners, and non-blocking asynchronous actions. |
| **Toast Notifications** | Elegant floating alerts for successful actions, warnings, and errors. |
| **Light & Dark Mode** | Built-in theme switcher with automatic user preference detection and `localStorage` persistence. |
| **Responsive Design** | Custom CSS Grid and Flexbox layouts optimized for mobile, tablet, and desktop screens. |
| **Automated Tests** | 22 comprehensive unit and integration tests covering models, serializers, and API endpoints. |

---

## 🛠 Tech Stack

- **Backend**: Python 3.9+, Django 4.2 (LTS), Django REST Framework 3.16, `django-filter`, `psycopg2-binary`, `django-cors-headers`, `python-dotenv`.
- **Database**: PostgreSQL (recommended for production/full evaluation) / SQLite (pre-configured local dev fallback).
- **Frontend**: Semantic HTML5, CSS3 with Custom Properties (variables), Modern Vanilla JavaScript (ES6+ Fetch API, async/await).
- **Icons & Typography**: Remix Icons, Google Fonts (Inter).

---

## 📂 Project Structure

```text
Task5_Task_Tracker/
│
├── task_tracker/                # Django core project configuration
│   ├── __init__.py
│   ├── asgi.py                  # ASGI server entry point
│   ├── settings.py              # Main settings (DB, REST_FRAMEWORK, CORS, apps)
│   ├── urls.py                  # Root URL router
│   └── wsgi.py                  # WSGI server entry point
│
├── tasks/                       # Task management application
│   ├── admin.py                 # Django Admin model registration
│   ├── apps.py                  # App configuration
│   ├── filters.py               # Django FilterSet (status, priority, due date range)
│   ├── models.py                # Task database model with choices and properties
│   ├── pagination.py            # Custom DRF pagination response structure
│   ├── serializers.py           # TaskSerializer with field-level validations
│   ├── views.py                 # TaskViewSet (CRUD + stats + toggle) and index_view
│   ├── urls.py                  # API router and home view routing
│   │
│   ├── management/              # Custom management commands
│   │   └── commands/
│   │       └── seed_tasks.py    # Sample data generator: "manage.py seed_tasks"
│   │
│   ├── migrations/              # Database migration files
│   │   ├── 0001_initial.py
│   │   └── __init__.py
│   │
│   └── tests/                   # Automated test suite (22 tests)
│       ├── __init__.py
│       ├── test_models.py       # Task model unit tests
│       ├── test_serializers.py  # Serializer validation tests
│       └── test_api.py          # REST API integration tests
│
├── templates/
│   └── index.html               # Main frontend single-page dashboard
│
├── static/
│   ├── css/
│   │   └── style.css            # Responsive styles, theme variables, modals, toasts
│   └── js/
│       └── app.js               # Frontend JavaScript controller (API client, UI logic)
│
├── .env.example                 # Environment configuration template
├── .env                         # Active local environment variables
├── requirements.txt             # Python dependencies list
├── manage.py                    # Django management script
└── README.md                    # Project documentation
```

---

## 🚀 Beginner Step-by-Step Setup

Follow these steps to run the application on your computer.

### 1. Prerequisites
Ensure you have the following installed:
- **Python 3.9 or newer**: [Download Python](https://www.python.org/downloads/) (make sure to check *"Add Python to PATH"* during installation).
- **PostgreSQL** (optional for testing, required for full DB persistence evaluation): [Download PostgreSQL](https://www.postgresql.org/download/).

---

### 2. Clone or Navigate to the Project
Open your terminal (PowerShell or Command Prompt) and navigate to the project directory:
```bash
cd c:\Users\admin\Downloads\Task5_Task_Tracker
```

---

### 3. Create and Activate a Virtual Environment
A virtual environment keeps project dependencies isolated:

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**On Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

---

### 4. Install Dependencies
Install all required libraries using `pip`:
```bash
python -m pip install -r requirements.txt
```

---

### 5. Database Configuration (PostgreSQL & SQLite)

The application includes an environment file `.env` configured to manage database connections effortlessly.

#### Option A: Using PostgreSQL (Recommended)
1. Open your PostgreSQL terminal (`psql`) or pgAdmin and run:
   ```sql
   CREATE DATABASE task_tracker_db;
   ```
2. Open the `.env` file in the root folder and configure your PostgreSQL credentials:
   ```ini
   DB_ENGINE=postgresql
   DB_NAME=task_tracker_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=127.0.0.1
   DB_PORT=5432

   # Set USE_SQLITE to False to use PostgreSQL:
   USE_SQLITE=False
   ```

#### Option B: Using SQLite (Instant Out-of-the-Box Development)
If you do not have a PostgreSQL server running right now and wish to test the application immediately, simply set:
```ini
USE_SQLITE=True
```
The application will automatically use a local SQLite database (`db.sqlite3`).

---

### 6. Apply Database Migrations
Create the necessary database tables:
```bash
python manage.py makemigrations
python manage.py migrate
```

---

### 7. Seed Sample Data (Optional)
To pre-populate your database with a collection of realistic internship tasks:
```bash
python manage.py seed_tasks
```

---

### 8. Create an Admin User (Optional)
If you wish to access the Django Administration panel:
```bash
python manage.py createsuperuser
```

---

### 9. Run the Development Server
Start the local web server:
```bash
python manage.py runserver
```

Now open your web browser and visit:
👉 **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

To access the Django Admin panel:
👉 **[http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)**

---

## 📡 REST API Reference

All task endpoints are available under the `/api/` prefix.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks/` | List paginated tasks (supports search, filter, and ordering) |
| `POST` | `/api/tasks/` | Create a new task |
| `GET` | `/api/tasks/{id}/` | Retrieve a specific task by ID |
| `PUT` | `/api/tasks/{id}/` | Update all fields of an existing task |
| `PATCH` | `/api/tasks/{id}/` | Partially update a task |
| `DELETE` | `/api/tasks/{id}/` | Permanently delete a task |
| `GET` | `/api/tasks/stats/` | Get summary metrics (totals, completed, pending, overdue) |
| `PATCH` | `/api/tasks/{id}/toggle/` | Quickly toggle status between `COMPLETED` and `PENDING` |

### Query Parameters for `GET /api/tasks/`
- `search=<keyword>`: Searches across task `title` and `description`.
- `status=<PENDING|IN_PROGRESS|COMPLETED>`: Filters tasks by status.
- `priority=<LOW|MEDIUM|HIGH|URGENT>`: Filters tasks by priority.
- `ordering=<-created_at|created_at|due_date|-due_date|title|-title>`: Sorts results.
- `page=<integer>`: Page number (e.g. `?page=2`).
- `page_size=<integer>`: Number of results per page (defaults to 6).

### Sample Request Payload (`POST /api/tasks/`)
```json
{
  "title": "Configure PostgreSQL Connection",
  "description": "Verify psycopg2 database adapter and environment variables.",
  "status": "PENDING",
  "priority": "HIGH",
  "due_date": "2026-11-05"
}
```

### Sample Response (`GET /api/tasks/`)
```json
{
  "count": 8,
  "total_pages": 2,
  "current_page": 1,
  "page_size": 6,
  "next": "http://127.0.0.1:8000/api/tasks/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Setup PostgreSQL Database and Models",
      "description": "Configure database connection settings, models, migrations, and indexing.",
      "status": "COMPLETED",
      "status_display": "Completed",
      "priority": "HIGH",
      "priority_display": "High",
      "due_date": "2026-10-22",
      "is_overdue": false,
      "created_at": "2026-10-24 23:17:03",
      "updated_at": "2026-10-24 23:17:03"
    }
  ]
}
```

---

## 🧪 Running Automated Tests

A comprehensive test suite verifies models, serializers, and REST endpoints. Run all tests with:

```bash
python manage.py test
```

### Test Coverage Highlights:
- **`tasks/tests/test_models.py`**:
  - Model creation with custom attributes and default values.
  - Model string representation `__str__`.
  - Overdue calculation logic based on current date and completion state.
- **`tasks/tests/test_serializers.py`**:
  - Valid data serialization and deserialization.
  - Blank and whitespace-only title validation.
  - Title length constraints (minimum 3 characters).
  - Status and Priority choice validation.
  - Read-only and computed properties.
- **`tasks/tests/test_api.py`**:
  - Frontend SPA view rendering (`200 OK`).
  - Paginated list response format.
  - Full CRUD operations (`POST`, `GET`, `PUT`, `PATCH`, `DELETE`).
  - Search query filtering across multiple fields.
  - Status and Priority query filtering.
  - Statistics endpoint calculations (`/api/tasks/stats/`).
  - Rapid status toggling endpoint (`/api/tasks/{id}/toggle/`).

---

## 🎨 UI & UX Highlights

1. **Reactive Dashboard Metrics**:
   - Live counters displaying total, pending, in-progress, and completed tasks.
   - Dynamic progress bar showing the real-time completion percentage.
2. **Debounced Live Search & Multi-Filter**:
   - Searches without lag as you type.
   - Independent status and priority drop-downs with a one-click reset button.
3. **Modal Dialogs**:
   - Smooth backdrop blur and keyboard accessibility (Esc key to close).
   - Character counters for title (`0/200`) and description (`0/1000`).
   - Field-level validation display with red error borders directly beneath invalid inputs.
4. **Toast Notification System**:
   - Non-intrusive alerts for create, update, delete, and toggle actions.
   - Smooth entrance and auto-dismiss animations.
5. **Dark Mode & Light Mode**:
   - Clean color palette built for readability and eye comfort.
   - Saves preference in browser storage.

---

## 📄 License
This project was created for the **YRNovatech Full Stack Internship Program**. All rights reserved.
