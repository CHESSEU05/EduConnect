# EduConnect Screen Inventory

## Public Screens

| Screen | Route | Primary users | Purpose | Key states |
| --- | --- | --- | --- | --- |
| Landing page | `/` | Guests | Introduce EduConnect and direct users to course discovery, registration, and login. | Default, loading featured courses, API error. |
| Course catalog | `/courses` | Guests, students, instructors | Show published courses with search and filters. | Loading, empty results, filtered results, API error. |
| Course details | `/courses/:courseId` | Guests, students, instructors | Show published course details, module overview, XAF price, rating, and enrollment count. | Loading, not found, draft hidden, enrolled, not enrolled. |
| Register | `/register` | Guests | Create a student or instructor account. | Form validation, duplicate email, duplicate username, success. |
| Login | `/login` | Guests | Authenticate an existing user. | Form validation, invalid credentials, success. |

## Student Screens

| Screen | Route | Purpose | Key requirements |
| --- | --- | --- | --- |
| Student dashboard | `/student/dashboard` | Provide quick access to enrolled courses and course discovery. | Must require student role. |
| Student profile | `/student/profile` | Update profile and change password. | Must validate profile fields and current password for password changes. |
| Enrolled courses | `/student/courses` | List courses the student has enrolled in. | Must handle empty state and loading state. |
| Learning view | `/student/courses/:courseId/learn` | Display accessible course modules in order. | Must require student enrolment. |
| Review controls | Course details or learning view | Create, update, or delete the student's review. | Must allow only one review per enrolled student per course. |

## Instructor Screens

| Screen | Route | Purpose | Key requirements |
| --- | --- | --- | --- |
| Instructor dashboard | `/instructor/dashboard` | Summarize owned courses and direct instructors to management workflows. | Must require instructor role. |
| Instructor profile | `/instructor/profile` | Update profile and change password. | Must validate profile fields and current password for password changes. |
| My courses | `/instructor/courses` | List instructor-owned draft and published courses. | Must show status, enrollment count, and average rating. |
| Create course | `/instructor/courses/new` | Create a new draft or published course. | Must validate required course fields and non-negative XAF price. |
| Edit course | `/instructor/courses/:courseId/edit` | Update an owned course. | Must block access to courses owned by another instructor. |
| Module management | Within edit course | Add, edit, delete, and reorder modules. | Must persist explicit ordering. |
| Enrolled students | `/instructor/courses/:courseId/students` | Show students enrolled in an owned course. | Must require ownership. |
| Course reviews | `/instructor/courses/:courseId/reviews` | Show reviews for an owned course. | Must require ownership. |

## Shared UI Requirements

- Use mobile-first layouts.
- Keep pages lightweight and readable on lower-end devices.
- Show loading, empty, validation, and API error states.
- Use simple labels and direct error messages.
- Avoid autoplay video and large media payloads.
- Display paid course prices in XAF.
- Keep protected screens inaccessible without the correct authenticated role.

## Future Enhancements

- Admin screens.
- Payment screens.
- Certificate screens.
- Instructor analytics screens.
