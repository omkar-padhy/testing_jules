# Secure Online Examination Management System (SEMS)

SEMS is a full-stack web platform for conducting secure online exams with role-based workflows for Admin, Teacher, and Student users.

## Features

- **Role-based Workflows**: Supports `Admin`, `Teacher`, and `Student` roles.
- **Exam Management**: Teachers and Admins can create exams with multiple-choice questions.
- **Secure Authentication**: JWT-based authentication and `bcrypt` password hashing.
- **Webcam Proctoring**: TensorFlow.js and BlazeFace integration to ensure only one face is visible during the exam.
- **Responsive Frontend**: Built with React 19, Vite 8, and Tailwind CSS 4.
- **Robust Backend**: Node.js and Express 4 connected to a PostgreSQL database.

## Prerequisites

- Node.js (v18 or above recommended)
- PostgreSQL (Ensure it is running locally)

## Installation & Setup

### 1. Database Setup
Start your local PostgreSQL server and create a database named `sems`:

\`\`\`bash
# Start PostgreSQL service
sudo service postgresql start

# Log into PostgreSQL and create the database
sudo -u postgres psql -c "CREATE DATABASE sems;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
\`\`\`

### 2. Backend Setup
Navigate to the `backend` directory:
\`\`\`bash
cd backend
npm install
\`\`\`

Create a `.env` file in the `backend` directory (do not commit this):
\`\`\`env
PORT=5000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/sems
JWT_SECRET=your_jwt_super_secret
ADMIN_SECRET=your_admin_registration_secret
\`\`\`

Initialize the database schema:
\`\`\`bash
node init_db.js
\`\`\`

Start the backend development server:
\`\`\`bash
npm run nodemon
\`\`\`
The server will run on `http://localhost:5000`.

### 3. Frontend Setup
Navigate to the `frontend` directory:
\`\`\`bash
cd frontend
npm install
\`\`\`

Create a `.env` file in the `frontend` directory:
\`\`\`env
VITE_API_BASE_URL=http://localhost:5000
\`\`\`

Start the frontend development server:
\`\`\`bash
npm run vite
\`\`\`
The application will be accessible at `http://localhost:5173`.

## Roles & Registration
- **Student**: Default role. Anyone can register.
- **Teacher / Admin**: Requires the `ADMIN_SECRET` defined in your backend environment variables during registration to grant elevated privileges.
