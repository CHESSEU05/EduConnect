# EduConnect Product Requirements

## Purpose

EduConnect is a full-stack online learning platform for Cameroonian university students, graduates, independent learners, instructors, tutors, and small training organisations.

The MVP helps learners discover courses, enrol in published courses, access course modules, and review completed learning experiences. It helps instructors create, publish, manage, and monitor their own courses.

## Target Users

| User type | Primary needs |
| --- | --- |
| Guest | Discover the platform, browse published courses, search, filter, view course details, register, and log in. |
| Student | Manage an account, find courses, enrol, access modules, and review enrolled courses. |
| Instructor | Manage an account, create course drafts, publish courses, maintain modules, and view enrolments and reviews. |
| Admin | Reserved for future use. No admin functionality is in the MVP. |

## MVP Scope

### Guest Capabilities

- View the landing page.
- Browse published courses.
- Search and filter courses.
- View course details.
- Register as a student or instructor.
- Log in.

### Student Capabilities

- Manage profile information.
- Change password.
- Browse published courses.
- Enrol in courses.
- View enrolled courses.
- Access course modules for enrolled courses.
- Create, update, and delete their own reviews.
- Submit ratings from 1 to 5.

### Instructor Capabilities

- Manage profile information.
- Change password.
- Create courses.
- Add and manage course modules.
- Save courses as drafts.
- Publish courses.
- Update and delete only their own courses.
- View students enrolled in their own courses.
- View reviews for their own courses.

## Course Requirements

Each course must support:

- Title.
- Short description.
- Full description.
- Category.
- Level.
- Language.
- Thumbnail URL.
- Price in XAF.
- Free or paid status.
- Draft or published status.
- Instructor ownership.
- Ordered modules.
- Average rating.
- Enrollment count.

## Course Module Requirements

Each module must support:

- Title.
- Description.
- Text content.
- External video URL.
- Resource URL.
- Ordering.

Modules are part of the course learning experience. The MVP links to external video and resource URLs instead of hosting media files.

## Cameroon-Oriented Constraints

- Design mobile-first screens.
- Keep the experience low-bandwidth friendly.
- Avoid video hosting in the MVP.
- Avoid payment processing in the MVP.
- Display paid course prices in XAF.
- Use simple and accessible language.
- Optimize image and API usage.
- Support lower-end devices and unstable networks.

## MVP Non-Goals

- Payment processing.
- Video upload, transcoding, or streaming infrastructure.
- Admin dashboards.
- Certificates.
- Live classes.
- Messaging.
- Assignments, quizzes, or grading.
- Offline-first synchronization.

## Success Criteria

- Guests can discover and inspect published courses without signing in.
- Students can register, log in, enrol, access modules, and manage one review per enrolled course.
- Instructors can manage only their own courses and see enrolment and review information for those courses.
- Draft courses are hidden from public browsing.
- Backend authorization enforces every role and ownership rule.
- The UI remains usable on mobile devices and unstable networks.

## Future Enhancements

- Admin role and moderation tools.
- Payments and paid-course checkout.
- Hosted video and file storage.
- Certificates.
- Quizzes and assignments.
- Notifications.
- Instructor analytics.
