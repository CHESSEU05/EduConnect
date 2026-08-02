# EduConnect API Specification

## API Conventions

- Base path: `/api/v1`.
- Format: JSON requests and JSON responses.
- Authentication: JWT bearer token for protected endpoints.
- Validation: Zod for request bodies, route params, and query strings.
- Authorization: Enforced by backend middleware and services.

## Response Envelope

Successful responses should use:

```json
{
  "success": true,
  "data": {}
}
```

Error responses should use:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": []
}
```

## Common Status Codes

| Status | Usage |
| --- | --- |
| `200 OK` | Successful read, update, login, or delete response. |
| `201 Created` | Successful registration, course creation, enrolment, module creation, or review creation. |
| `204 No Content` | Optional response for successful deletes. |
| `400 Bad Request` | Invalid request data or malformed IDs. |
| `401 Unauthorized` | Missing or invalid authentication. |
| `403 Forbidden` | Authenticated user lacks role, ownership, or enrolment access. |
| `404 Not Found` | Resource does not exist or is not visible to the requester. |
| `409 Conflict` | Duplicate email, username, enrolment, or review. |
| `500 Internal Server Error` | Unexpected server error. |

## Authentication Endpoints

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Guest | Register a student or instructor. |
| `POST` | `/api/v1/auth/login` | Guest | Authenticate and return a JWT. |
| `GET` | `/api/v1/auth/me` | Authenticated | Return the current user without password hash. |

Register body:

```json
{
  "firstName": "Student",
  "lastName": "Name",
  "email": "student@example.com",
  "username": "student123",
  "password": "StrongPassword123!",
  "confirmPassword": "StrongPassword123!",
  "role": "student"
}
```

Login body:

```json
{
  "identifier": "student@example.com",
  "password": "StrongPassword123!"
}
```

## User Endpoints

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/users/me` | Authenticated | View current profile. |
| `PATCH` | `/api/v1/users/me` | Authenticated | Update permitted profile fields. |
| `PATCH` | `/api/v1/users/me/password` | Authenticated | Change password after current password verification. |

## Public Course Endpoints

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/courses` | Public | List published courses with search, filters, and pagination. |
| `GET` | `/api/v1/courses/:courseId` | Public | View published course details. |

Supported list query parameters:

- `search`
- `category`
- `level`
- `language`
- `isFree`
- `page`
- `limit`

## Instructor Course Endpoints

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/instructor/courses` | Instructor | List courses owned by the instructor, including drafts. |
| `POST` | `/api/v1/instructor/courses` | Instructor | Create a course. |
| `GET` | `/api/v1/instructor/courses/:courseId` | Owning instructor | View an owned course. |
| `PATCH` | `/api/v1/instructor/courses/:courseId` | Owning instructor | Update an owned course. |
| `DELETE` | `/api/v1/instructor/courses/:courseId` | Owning instructor | Delete an owned course. |
| `PATCH` | `/api/v1/instructor/courses/:courseId/publish` | Owning instructor | Publish a valid course. |
| `PATCH` | `/api/v1/instructor/courses/:courseId/draft` | Owning instructor | Move an owned course back to draft. |
| `GET` | `/api/v1/instructor/courses/:courseId/students` | Owning instructor | View enrolled students. |
| `GET` | `/api/v1/instructor/courses/:courseId/reviews` | Owning instructor | View course reviews. |

Course create and update body:

```json
{
  "title": "Introduction to Web Development",
  "shortDescription": "Learn the basics of web development.",
  "fullDescription": "A beginner-friendly course for HTML, CSS, and JavaScript foundations.",
  "category": "Technology",
  "level": "Beginner",
  "language": "English",
  "thumbnailUrl": "https://example.com/course.jpg",
  "priceXaf": 0,
  "isFree": true,
  "status": "draft"
}
```

## Instructor Module Endpoints

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/instructor/courses/:courseId/modules` | Owning instructor | Add a module. |
| `PATCH` | `/api/v1/instructor/courses/:courseId/modules/:moduleId` | Owning instructor | Update a module. |
| `DELETE` | `/api/v1/instructor/courses/:courseId/modules/:moduleId` | Owning instructor | Delete a module. |
| `PATCH` | `/api/v1/instructor/courses/:courseId/modules/reorder` | Owning instructor | Persist module ordering. |

Module body:

```json
{
  "title": "Getting started",
  "description": "Course introduction",
  "textContent": "Welcome to the course.",
  "externalVideoUrl": "https://example.com/video",
  "resourceUrl": "https://example.com/resource.pdf",
  "order": 1
}
```

## Student Enrollment and Learning Endpoints

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/courses/:courseId/enrollments` | Student | Enrol in a published course. |
| `GET` | `/api/v1/users/me/enrollments` | Student | List current student's enrolled courses. |
| `GET` | `/api/v1/courses/:courseId/modules` | Enrolled student | Access modules for an enrolled course. |

## Review Endpoints

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/courses/:courseId/reviews` | Public | List reviews for a published course. |
| `POST` | `/api/v1/courses/:courseId/reviews` | Enrolled student | Create one review for the course. |
| `PATCH` | `/api/v1/courses/:courseId/reviews/:reviewId` | Review owner | Update own review. |
| `DELETE` | `/api/v1/courses/:courseId/reviews/:reviewId` | Review owner | Delete own review. |

Review body:

```json
{
  "rating": 5,
  "comment": "Clear and useful course."
}
```

## Authorization Matrix

| Resource action | Required access |
| --- | --- |
| Create course | Instructor role. |
| Update or delete course | Instructor role and course ownership. |
| Publish course | Instructor role, course ownership, valid course data. |
| Enrol in course | Student role and published course. |
| Access modules | Student role and existing enrolment. |
| Create review | Student role and existing enrolment. |
| Update or delete review | Review ownership. |
| View instructor enrolments | Instructor role and course ownership. |
| View instructor reviews | Instructor role and course ownership. |

## Future Enhancements

- Admin endpoints.
- Payment endpoints.
- Certificate endpoints.
- Media upload endpoints.
