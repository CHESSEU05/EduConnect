import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { listCategoriesRequest } from '../../api/category.api';
import {
  getInstructorCourseRequest,
  publishInstructorCourseRequest,
  updateInstructorCourseRequest,
} from '../../api/course.api';
import { CourseForm } from '../../components/courses/CourseForm';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { PageLoader } from '../../components/feedback/PageLoader';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Category, Course, CourseFormRequest } from '../../types/course';
import { getErrorMessage } from '../../utils/errors';

export function EditCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useDocumentTitle(course?.title ? `Edit ${course.title}` : 'Edit Course');

  const load = async () => {
    if (!courseId) {
      setError('Course id is missing.');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const [categoryList, courseData] = await Promise.all([
        listCategoriesRequest(),
        getInstructorCourseRequest(courseId),
      ]);
      setCategories(categoryList);
      setCourse(courseData);
      setStatus('success');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  };

  useEffect(() => {
    void load();
  }, [courseId]);

  const save = async (input: CourseFormRequest, publish: boolean) => {
    if (!courseId) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateInstructorCourseRequest(courseId, input);

      if (publish) {
        await publishInstructorCourseRequest(courseId);
        toast.success('Course published successfully.');
      } else {
        toast.success('Course saved successfully.');
      }

      navigate('/instructor/courses');
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <PageLoader message="Loading course" />;
  }

  if (status === 'error') {
    return (
      <ErrorMessage
        action={<Button onClick={() => void load()}>Retry</Button>}
        message={error ?? 'Course could not be loaded.'}
        title="Unable to load course"
      />
    );
  }

  return (
    <div>
      <header className="mb-6">
        <p className="text-sm font-bold uppercase text-brand-blue">Course builder</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy">Edit course</h1>
      </header>
      <CourseForm
        categories={categories}
        course={course}
        isSubmitting={isSubmitting}
        onPublish={(input) => save(input, true)}
        onSaveDraft={(input) => save(input, false)}
      />
    </div>
  );
}
