import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Languages,
  MonitorSmartphone,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
  WifiOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { listCategoriesRequest } from '../../api/category.api';
import { listPublicCoursesRequest } from '../../api/course.api';
import { CourseCard } from '../../components/courses/CourseCard';
import { Container } from '../../components/common/Container';
import { Logo } from '../../components/common/Logo';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { SkeletonBlock } from '../../components/feedback/SkeletonBlock';
import { useApiHealth } from '../../hooks/useApiHealth';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Category, Course } from '../../types/course';
import { getErrorMessage } from '../../utils/errors';

type ApiStatus = 'checking' | 'connected' | 'unavailable';

const statusContent: Record<ApiStatus, { label: string; className: string }> = {
  checking: {
    label: 'Checking API...',
    className: 'border-slate-200 bg-white text-text-secondary',
  },
  connected: {
    label: 'API connected',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  unavailable: {
    label: 'API unavailable',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
};

export function HomePage() {
  useDocumentTitle('Home');
  const { data, errorMessage, status: healthStatus } = useApiHealth();
  const { isAuthenticated, role, user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [contentStatus, setContentStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [contentError, setContentError] = useState<string | null>(null);
  const apiStatus: ApiStatus =
    healthStatus === 'loading'
      ? 'checking'
      : healthStatus === 'success'
        ? 'connected'
        : 'unavailable';
  const status = statusContent[apiStatus];
  const dashboardPath = role === 'instructor' ? '/instructor' : '/student';

  useEffect(() => {
    let isMounted = true;

    const loadHomeContent = async () => {
      setContentStatus('loading');
      setContentError(null);

      try {
        const [categoryList, courseList] = await Promise.all([
          listCategoriesRequest(),
          listPublicCoursesRequest({ limit: 4, sort: 'popular' }),
        ]);

        if (isMounted) {
          setCategories(categoryList);
          setCourses(courseList.courses);
          setContentStatus('success');
        }
      } catch (error) {
        if (isMounted) {
          setContentError(getErrorMessage(error));
          setContentStatus('error');
        }
      }
    };

    void loadHomeContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main>
      <section className="hero-stage">
        <Container className="relative grid gap-10 py-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-14">
          <div className="reveal-up">
            <div
              className={`mb-6 inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-semibold shadow-sm ${status.className}`}
              title={errorMessage ?? data?.message ?? undefined}
            >
              {apiStatus === 'checking' ? <LoadingSpinner label="Checking API" /> : null}
              {apiStatus === 'connected' ? <CheckCircle2 className="h-4 w-4" /> : null}
              {apiStatus === 'unavailable' ? <WifiOff className="h-4 w-4" /> : null}
              <span>{status.label}</span>
            </div>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-emerald-700 ring-1 ring-emerald-100">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              Learn. Grow. Succeed.
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-brand-navy sm:text-5xl lg:text-6xl">
              Learn new skills, advance your{' '}
              <span className="text-brand-green">future</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
              Discover quality courses from instructors, learn at your own
              pace, and keep the experience friendly for mobile devices and
              unstable networks.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Link
                className="btn-primary-polish shine inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-blue px-4 text-sm font-bold text-white hover:bg-primary-700"
                to="/courses"
              >
                Explore courses
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              {isAuthenticated ? (
                <Link
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-brand-green bg-white px-4 py-2 text-sm font-bold text-brand-green shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 sm:col-span-2"
                  to={dashboardPath}
                >
                  <GraduationCap aria-hidden="true" className="h-4 w-4" />
                  Continue as {user?.firstName ?? 'learner'}
                </Link>
              ) : (
                <>
                  <Link
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-brand-green bg-white px-4 py-2 text-sm font-bold text-brand-green shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
                    to="/register?role=student"
                  >
                    <UserPlus aria-hidden="true" className="h-4 w-4" />
                    Register as student
                  </Link>
                  <Link
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
                    to="/register?role=instructor"
                  >
                    <GraduationCap aria-hidden="true" className="h-4 w-4" />
                    Become instructor
                  </Link>
                </>
              )}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { value: '80+', label: 'Courses planned', icon: BookOpen },
                { value: '2k+', label: 'Learner goal', icon: Users },
                { value: '40+', label: 'Instructor goal', icon: GraduationCap },
                { value: '4.7/5', label: 'Quality target', icon: Trophy },
              ].map(({ icon: Icon, label, value }) => (
                <div className="elevated-card rounded-lg border border-slate-200 bg-white p-3" key={label}>
                  <Icon aria-hidden="true" className="mb-2 h-5 w-5 text-brand-blue" />
                  <p className="text-lg font-bold text-brand-navy">{value}</p>
                  <p className="text-xs font-bold text-text-secondary">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal-up relative">
            <div className="hero-visual hero-visual-grid rounded-lg p-5">
              <div className="flex items-center justify-between gap-3">
                <Logo size="large" />
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                  <PlayCircle aria-hidden="true" className="h-4 w-4" />
                  Live preview
                </span>
              </div>
              <div className="mt-5 rounded-lg bg-brand-navy p-5 text-white shadow-xl">
                <p className="text-sm font-bold text-blue-100">
                  Featured learning path
                </p>
                <p className="mt-2 text-2xl font-extrabold">
                  React for Beginners
                </p>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                  <span className="block h-full w-2/3 rounded-full bg-brand-green" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <span className="rounded-md bg-white/10 px-2 py-2">12 lessons</span>
                  <span className="rounded-md bg-white/10 px-2 py-2">English</span>
                  <span className="rounded-md bg-white/10 px-2 py-2">Beginner</span>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="float-soft rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <GraduationCap className="h-6 w-6 text-brand-green" />
                  <p className="mt-3 text-sm font-bold text-brand-navy">Student journeys</p>
                </div>
                <div className="float-soft rounded-lg border border-slate-200 bg-white p-4 shadow-sm [animation-delay:120ms]">
                  <MonitorSmartphone className="h-6 w-6 text-brand-blue" />
                  <p className="mt-3 text-sm font-bold text-brand-navy">Mobile-first</p>
                </div>
                <div className="float-soft rounded-lg border border-slate-200 bg-white p-4 shadow-sm [animation-delay:240ms]">
                  <Languages className="h-6 w-6 text-brand-amber" />
                  <p className="mt-3 text-sm font-bold text-brand-navy">XAF + local needs</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-emerald-100 bg-white p-4 text-brand-navy shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">Ready for real users</p>
                    <p className="text-xs text-text-secondary">
                      API-connected public, student, and instructor workflows.
                    </p>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-brand-green" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 reveal-up">
            <div>
              <p className="text-sm font-bold uppercase text-brand-blue">Popular categories</p>
              <h2 className="mt-2 text-2xl font-bold text-brand-navy">
                Browse by subject
              </h2>
            </div>
            <Link className="text-sm font-bold text-brand-blue" to="/courses">
              View all courses
            </Link>
          </div>
          {contentStatus === 'loading' ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <SkeletonBlock className="h-24" key={index} />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 4).map((category) => (
                <Link
                  className="elevated-card rounded-lg border border-slate-200 bg-white p-4"
                  key={category.id}
                  to={`/courses?category=${category.slug}`}
                >
                  <BookOpen className="h-5 w-5 text-brand-blue" />
                  <h3 className="mt-3 font-bold text-brand-navy">{category.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                    {category.description ?? 'Explore practical learning content.'}
                  </p>
                </Link>
              ))}
            </div>
          )}
          {contentStatus === 'error' ? (
            <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber-800">
              {contentError}
            </p>
          ) : null}
        </Container>
      </section>

      <section className="bg-white/60">
        <Container className="py-10">
          <div className="mb-6 text-center">
            <p className="text-sm font-bold uppercase text-brand-blue">
              Featured courses
            </p>
            <h2 className="mt-2 text-2xl font-bold text-brand-navy">
              Popular online courses
            </h2>
          </div>
          {contentStatus === 'loading' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <SkeletonBlock className="h-72" key={index} />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {courses.map((course) => (
                <CourseCard course={course} key={course.id} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-text-secondary">
              Published courses will appear here once instructors publish them.
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
