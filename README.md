# Online Course Platform

A full-stack application built with ASP.NET Core 8 Web API and React + Vite (TypeScript).

## Features
- **Authentication**: JWT-based login and registration
- **Role-based Access**: Admin, Instructor, Student
- **Course Management**: Instructors and Admins can create courses and upload thumbnails
- **Student Learning**: Browse, search, filter, and enroll in courses (mock Stripe integration)
- **Responsive UI**: Glassmorphic, modern design system built with custom CSS

## Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [Node.js](https://nodejs.org/en) (v18 or v20)
- (Optional) Docker & docker-compose

## Running Locally (Development Mode)

### Backend
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Run Entity Framework migrations (if not already applied):
   ```bash
   dotnet ef database update
   ```
3. Run the API (it runs on `https://localhost:5001` or `http://localhost:5000` by default based on configuration, our code assumes `https://localhost:5001` for the frontend):
   ```bash
   dotnet run
   ```

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The UI will be available at `http://localhost:5173`.

## Running with Docker Compose

1. From the root directory:
   ```bash
   docker-compose up --build
   ```
2. Access the frontend at `http://localhost:3000`.
3. The API will be exposed on port `5000`.

*Note: For the Docker mode, the frontend is served via Nginx and points to the backend. You may need to map API URLs dynamically based on the environment instead of hardcoded `localhost:5001`.*

## Initial Data Seed
The application seeds users on the first run. E.g:
- Admin: `admin@example.com` (Password: `Password123!`)
- Instructor: `instructor@example.com` (Password: `Password123!`)
- Student: `student@example.com` (Password: `Password123!`)
