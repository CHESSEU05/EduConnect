# EduConnect Business Rules

## Identity and Authentication

| Rule | Requirement |
| --- | --- |
| Unique email | No two users can share the same email address. |
| Unique username | No two users can share the same username. |
| Password storage | Passwords must be hashed with bcrypt before storage. |
| Login | Login must issue a JWT for valid credentials only. |
| Protected routes | Private API endpoints require authentication middleware. |
| Role source | Role and identity must come from verified backend authentication, not from client input. |

## Roles

| Role | MVP access |
| --- | --- |
| guest | Public course discovery and authentication screens only. |
| student | Profile, password change, enrolment, enrolled course access, ratings, and reviews. |
| instructor | Profile, password change, course creation, module management, publishing, enrolment visibility, and review visibility for owned courses. |
| admin | Reserved for future use. No MVP permissions. |

## Course Rules

- Only instructors can create courses.
- Instructors can update and delete only their own courses.
- A course must have an instructor owner.
- A course status must be either `draft` or `published`.
- Only `published` courses appear in public course lists and public search results.
- Draft courses are visible only to the owning instructor.
- Course prices cannot be negative.
- A course marked as free must have a price of `0`.
- A course marked as paid must display its price in XAF.
- Average rating and enrollment count must be derived from reviews and enrolments, not trusted from client input.

## Module Rules

- Only the owning instructor can add, update, reorder, or remove modules.
- Modules must belong to a course.
- Module ordering must be stable and explicit.
- Module content can include text, an external video URL, and an external resource URL.
- The MVP must not upload or host video files.

## Enrollment Rules

- Only students can enrol in courses.
- Students can enrol only in published courses.
- Duplicate enrolment in the same course is forbidden.
- Enrollment count must increase only after a successful new enrolment.
- Instructors can view enrolments only for courses they own.

## Review and Rating Rules

- Only students can review a course.
- Only enrolled students can review a course.
- A student can have only one review per course.
- Ratings must be whole numbers from 1 to 5.
- Students can update and delete only their own reviews.
- Instructors can view reviews only for courses they own.
- Public course details can show aggregate rating information for published courses.

## Access Control Rules

- Frontend route protection is required for user experience, but backend authorization is the source of truth.
- Every protected backend endpoint must validate authentication.
- Every role-specific backend endpoint must validate role permissions.
- Every ownership-sensitive backend endpoint must validate resource ownership.
- Invalid input must be rejected before business logic runs.

## Data Integrity Rules

- IDs must be validated before database queries.
- API responses must not expose password hashes.
- Environment variables and secrets must never be returned by the API.
- Deleted courses must no longer appear publicly.
- Deleting a course should also prevent access to its modules, enrolments, and reviews.

## Future Enhancements

- Admin moderation rules.
- Payment and refund rules.
- Certificate eligibility rules.
- Hosted media storage limits.
