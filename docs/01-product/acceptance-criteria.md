# EduConnect Acceptance Criteria

## Guest Experience

| Scenario | Acceptance criteria |
| --- | --- |
| Landing page | A guest can open the landing page without logging in and see a clear path to browse courses, register, or log in. |
| Browse courses | A guest sees only published courses. Draft courses are never shown publicly. |
| Search courses | A guest can search by course text such as title, description, category, or instructor name where supported by the backend. |
| Filter courses | A guest can filter courses by MVP fields such as category, level, language, and free or paid status. |
| Course details | A guest can view details for a published course, including title, descriptions, category, level, language, thumbnail, XAF price, modules overview, average rating, and enrollment count. |
| Authentication entry | A guest can register or log in from public screens. |

## Authentication and Profile

| Scenario | Acceptance criteria |
| --- | --- |
| Register | A user can register as `student` or `instructor` with unique email and username. |
| Duplicate identity | Registration fails with a clear error when email or username already exists. |
| Password hashing | Stored user records never contain plain-text passwords. |
| Login | A registered user can log in with valid credentials and receives an authenticated session token. |
| Invalid login | Login fails for invalid credentials without revealing whether the email or password was wrong. |
| Manage profile | Authenticated students and instructors can view and update permitted profile fields. |
| Change password | Authenticated users can change password after submitting the current password and a valid new password. |

## Student Course Access

| Scenario | Acceptance criteria |
| --- | --- |
| Browse as student | A student can browse and search published courses after logging in. |
| Enrol | A student can enrol in a published course. |
| Duplicate enrolment | A second enrolment attempt for the same student and course fails. |
| Enrolled courses | A student can view a list of courses they are enrolled in. |
| Module access | A student can access modules only for courses they are enrolled in. |
| Instructor restriction | An instructor account cannot enrol in a course. |

## Student Reviews and Ratings

| Scenario | Acceptance criteria |
| --- | --- |
| Create review | An enrolled student can create one review for a course and submit a rating from 1 to 5. |
| Prevent unenrolled review | A student who is not enrolled cannot review the course. |
| One review per course | A student cannot create more than one review for the same course. |
| Update review | A student can update only their own review. |
| Delete review | A student can delete only their own review. |
| Rating validation | Ratings below 1, above 5, or non-integer values are rejected. |

## Instructor Course Management

| Scenario | Acceptance criteria |
| --- | --- |
| Create course | An instructor can create a course with required course fields. |
| Save draft | An instructor can save a course as a draft. |
| Publish course | An instructor can publish a course after required fields pass validation. |
| Update own course | An instructor can update only courses they own. |
| Delete own course | An instructor can delete only courses they own. |
| Ownership protection | Attempts to update or delete another instructor's course fail with an authorization error. |
| Manage modules | The owning instructor can add, update, delete, and reorder modules. |
| View enrolled students | The owning instructor can view students enrolled in their courses. |
| View reviews | The owning instructor can view reviews for their courses. |

## Cameroon-Oriented Criteria

| Scenario | Acceptance criteria |
| --- | --- |
| Mobile-first UI | Primary guest, student, and instructor workflows are usable on small mobile screens. |
| Low bandwidth | Course lists and detail screens avoid unnecessary payloads and oversized images. |
| External media | Video fields accept external URLs only; the MVP does not upload or host video. |
| No payments | Paid courses display XAF prices but do not process payments. |
| Accessible language | Labels, messages, and errors use simple, direct language. |
| Unstable network | Loading, empty, and error states are visible for API-driven screens. |

## API and Security Criteria

- All API endpoints are prefixed with `/api/v1`.
- REST conventions and appropriate HTTP status codes are used.
- All external input is validated.
- Backend middleware protects private endpoints.
- Backend services enforce role and ownership restrictions.
- API responses follow a consistent JSON structure.
- Password hashes, JWT secrets, and environment variables are never exposed.

## Definition of Done

- Main success and failure paths are implemented.
- Type checking passes.
- Linting passes.
- Relevant tests cover validation, authentication, authorization, ownership, and duplicate prevention.
- Documentation is updated when behavior changes.
