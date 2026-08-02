import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { enrollInCourseRequest, getPublicCourseRequest } from '../../api/course.api';
import { listCourseReviewsRequest } from '../../api/review.api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Container } from '../../components/common/Container';
import { RatingStars } from '../../components/common/RatingStars';
import { RatingSummary } from '../../components/reviews/RatingSummary';
import { ReviewList } from '../../components/reviews/ReviewList';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { PageLoader } from '../../components/feedback/PageLoader';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Course } from '../../types/course';
import type { ReviewListData } from '../../types/review';
import { formatXaf } from '../../utils/currency';
import { getErrorMessage } from '../../utils/errors';

export function CourseDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<ReviewListData | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrollConfirmOpen, setIsEnrollConfirmOpen] = useState(false);
  useDocumentTitle(course?.title ?? 'Course Details');

  const load = async () => {
    if (!slug) {
      setError('Course slug is missing.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const courseData = await getPublicCourseRequest(slug);
      const reviewData = await listCourseReviewsRequest(courseData.id);
      setCourse(courseData);
      setReviews(reviewData);
      setStatus('success');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  };

  useEffect(() => {
    void load();
  }, [slug]);

  const requestEnroll = () => {
    if (!course) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${course.slug}` } } });
      return;
    }

    if (role !== 'student') {
      toast.info('Instructor accounts manage courses from the dashboard.');
      return;
    }

    setIsEnrollConfirmOpen(true);
  };

  const confirmEnroll = async () => {
    if (!course) {
      return;
    }

    setIsEnrollConfirmOpen(false);
    setIsEnrolling(true);

    try {
      await enrollInCourseRequest(course.id);
      toast.success('Enrolment completed successfully.');
      navigate(`/student/courses/${course.id}/learn`);
    } catch (enrollError) {
      toast.error(getErrorMessage(enrollError));
    } finally {
      setIsEnrolling(false);
    }
  };

  if (status === 'loading') {
    return <PageLoader message="Loading course details" />;
  }

  if (status === 'error' || !course) {
    return (
      <Container className="py-10">
        <ErrorMessage
          action={<Button onClick={() => void load()}>Retry</Button>}
          message={error ?? 'Course could not be loaded.'}
          title="Unable to load course"
        />
      </Container>
    );
  }

  return (
    <main>
      <Container className="py-8">
        <nav className="mb-5 text-sm font-semibold text-text-secondary">
          <Link className="hover:text-brand-blue" to="/courses">
            Courses
          </Link>{' '}
          / {course.title}
        </nav>
        <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="hero-visual aspect-video overflow-hidden rounded-lg">
              {course.thumbnailUrl ? (
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={course.thumbnailUrl}
                />
              ) : (
                <div className="grid h-full place-items-center text-white">
                  <BookOpen className="h-16 w-16" />
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="blue">{course.category.name}</Badge>
              <Badge>{course.level}</Badge>
              <Badge tone={course.isFree ? 'green' : 'amber'}>
                {course.isFree ? 'Free' : formatXaf(course.price)}
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-brand-navy sm:text-4xl">
              {course.title}
            </h1>
            <p className="mt-3 max-w-3xl text-text-secondary">
              {course.shortDescription}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1">
                <RatingStars rating={course.averageRating} />
                {course.averageRating.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course.enrollmentCount} students
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.moduleCount} modules
              </span>
            </div>
            <section className="soft-panel mt-8 rounded-lg p-5">
              <h2 className="text-xl font-bold text-brand-navy">About this course</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-text-secondary">
                {course.description}
              </p>
            </section>
            <section className="soft-panel mt-6 rounded-lg p-5">
              <h2 className="text-xl font-bold text-brand-navy">Curriculum</h2>
              <div className="mt-4 space-y-3">
                {(course.modules ?? []).map((module) => (
                  <article className="elevated-card rounded-md border border-slate-200 bg-white p-4" key={module.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold text-brand-navy">{module.title}</h3>
                      {module.isPreview ? <Badge tone="green">Preview</Badge> : <Badge>Locked</Badge>}
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{module.description}</p>
                    {module.isPreview && module.resourceUrl ? (
                      <a
                        className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-brand-blue"
                        href={module.resourceUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open resource
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          </div>
          <aside className="space-y-4">
            <div className="soft-panel sticky top-28 rounded-lg p-5">
              <p className="text-3xl font-bold text-brand-navy">
                {course.isFree ? 'Free' : formatXaf(course.price)}
              </p>
              <Button
                className="mt-4 w-full"
                disabled={isEnrolling || role === 'instructor'}
                onClick={requestEnroll}
              >
                {isEnrolling ? 'Enrolling...' : 'Enroll now'}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <ul className="mt-5 space-y-3 text-sm text-text-secondary">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-green" />
                  {course.moduleCount} modules and learning resources
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-green" />
                  External video/resource links only in the MVP
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-green" />
                  Accessible from mobile devices
                </li>
              </ul>
            </div>
            {reviews ? <RatingSummary summary={reviews.summary} /> : null}
          </aside>
        </section>
        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-brand-navy">Student reviews</h2>
          <ReviewList reviews={reviews?.reviews ?? []} />
        </section>
      </Container>
      <ConfirmDialog
        confirmLabel="Confirm enrolment"
        isLoading={isEnrolling}
        isOpen={isEnrollConfirmOpen}
        message={
          course.isFree
            ? `You are about to enrol in "${course.title}".`
            : `Payment processing is not part of the MVP yet. You can continue to request enrolment for "${course.title}".`
        }
        onCancel={() => setIsEnrollConfirmOpen(false)}
        onConfirm={() => void confirmEnroll()}
        title="Enrol in this course?"
      />
    </main>
  );
}
