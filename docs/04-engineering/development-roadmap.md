# EduConnect Development Roadmap

## Guiding Principles

- Build the MVP before future enhancements.
- Keep TypeScript strict across frontend and backend.
- Follow the backend flow: Route -> Middleware -> Controller -> Service -> Repository -> Model.
- Validate all external input with Zod.
- Enforce authentication, role permissions, and ownership in the backend.
- Keep the UI mobile-first and low-bandwidth friendly.
- Avoid payment processing and video hosting in the MVP.

## Phase 1: Project Foundation

Deliverables:

- Root package and workspace decision.
- Shared TypeScript, linting, and formatting configuration.
- `.env.example` with non-secret placeholders.
- Frontend Vite React TypeScript initialization.
- Backend Express TypeScript initialization.
- Basic folder structure aligned with `AGENTS.md`.
- Initial README setup instructions.

Exit criteria:

- Frontend and backend can install dependencies.
- Type checker and linter commands are defined.
- No secrets are committed.

## Phase 2: Backend Foundation

Deliverables:

- Express app setup under `/api/v1`.
- MongoDB connection configuration.
- Central error handling.
- Zod validation middleware.
- JWT authentication middleware.
- Role and ownership authorization helpers.
- User model, repository, service, and controller.
- Auth routes for register, login, and current user.

Exit criteria:

- Registration, login, and current-user endpoints work.
- Passwords are hashed.
- Duplicate email and username are rejected.
- Authentication failure paths are tested.

## Phase 3: Course and Module Backend

Deliverables:

- Course model with embedded modules.
- Course repository, service, controller, and routes.
- Public course browsing, search, filters, and details.
- Instructor course create, update, delete, draft, and publish workflows.
- Instructor module create, update, delete, and reorder workflows.

Exit criteria:

- Public endpoints show published courses only.
- Draft courses are visible only to the owner.
- Only instructors can create courses.
- Instructors can modify only their own courses.
- Course price and status validation is tested.

## Phase 4: Enrollment and Review Backend

Deliverables:

- Enrollment model, repository, service, controller, and routes.
- Review model, repository, service, controller, and routes.
- Student enrolment workflow.
- Student enrolled course list.
- Student module access for enrolled courses.
- Review create, update, delete, and list workflows.
- Average rating and enrollment count updates.

Exit criteria:

- Only students can enrol.
- Duplicate enrolment is rejected.
- Only enrolled students can access modules.
- Only enrolled students can review.
- One review per student per course is enforced.
- Ownership and authorization failure paths are tested.

## Phase 5: Frontend Foundation

Deliverables:

- React Router setup.
- Axios API client.
- Auth context and protected route components.
- Shared form patterns with React Hook Form and Zod.
- Tailwind mobile-first layout baseline.
- Public navigation and role-aware navigation.

Exit criteria:

- Guest, student, and instructor routes are separated.
- API errors, loading states, and empty states have reusable UI patterns.
- Frontend route protection matches backend role rules.

## Phase 6: Public and Student Frontend

Deliverables:

- Landing page.
- Course catalog with search and filters.
- Course detail page.
- Register and login screens.
- Student dashboard.
- Student profile and password screen.
- Enrolled courses screen.
- Learning view for course modules.
- Review and rating controls.

Exit criteria:

- Guest and student MVP workflows are usable on mobile.
- Paid course prices display in XAF.
- Course media usage remains low-bandwidth friendly.
- Student failure states are visible and understandable.

## Phase 7: Instructor Frontend

Deliverables:

- Instructor dashboard.
- Instructor profile and password screen.
- My courses screen.
- Course create and edit forms.
- Draft and publish controls.
- Module management UI.
- Enrolled students screen.
- Course reviews screen.

Exit criteria:

- Instructor workflows enforce ownership through backend responses.
- Draft and published statuses are clear.
- Course and module forms validate required fields.
- Instructor screens are usable on mobile.

## Phase 8: Quality and Release Readiness

Deliverables:

- Backend tests for validation, authentication, authorization, ownership, duplicate enrolment, and review rules.
- Frontend tests for critical forms and protected route behavior where practical.
- Manual QA checklist for guest, student, and instructor workflows.
- README setup, run, test, and environment documentation.
- Production deployment plan.

Exit criteria:

- Type checker passes.
- Linter passes.
- Relevant tests pass.
- Main success and failure paths work.
- Documentation matches implemented behavior.

## Future Enhancements

- Admin role and moderation tools.
- Payment processing for paid courses.
- Hosted media upload and video streaming.
- Certificates.
- Quizzes, assignments, and grading.
- Notifications.
- Analytics for instructors.
