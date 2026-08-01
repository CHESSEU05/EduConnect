# EduConnect Engineering Guidelines

## Project Overview

EduConnect is a full-stack online learning platform built with:

- React and TypeScript
- Node.js, Express, and TypeScript
- MongoDB and Mongoose
- JWT authentication

## Repository Structure

- `frontend/` contains the React application.
- `backend/` contains the Express REST API.
- `docs/` contains architecture and API documentation.

## General Rules

1. Use TypeScript throughout the project.
2. Do not use `any` unless there is a documented reason.
3. Follow separation of concerns.
4. Keep functions small and focused.
5. Validate all external input.
6. Never expose passwords, JWT secrets, or environment variables.
7. Add proper error handling to asynchronous operations.
8. Use descriptive variable, function, and file names.
9. Do not place business logic directly inside route files.
10. Update documentation when behavior changes.

## Backend Architecture

Use the following request flow:

Route → Middleware → Controller → Service → Repository → Model

Backend folders should include:

- config
- controllers
- middleware
- models
- repositories
- routes
- services
- types
- utils
- validators

## Frontend Architecture

Frontend folders should include:

- api
- components
- context
- hooks
- layouts
- pages
- routes
- schemas
- types
- utils

## API Rules

- Prefix API endpoints with `/api/v1`.
- Return consistent JSON responses.
- Use appropriate HTTP status codes.
- Protect private endpoints with authentication middleware.
- Enforce permissions in the backend.
- Never rely only on frontend route protection.

## Testing Rules

- Add tests for important business logic.
- Test authentication and authorization failures.
- Test invalid input.
- Test ownership restrictions.
- Do not consider a feature complete until its main success and failure paths work.

## Code Quality

Before completing a task:

1. Run the type checker.
2. Run the linter.
3. Run relevant tests.
4. Report files changed.
5. Report unresolved warnings or risks.