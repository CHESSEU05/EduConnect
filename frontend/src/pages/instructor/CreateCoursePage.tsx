import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { listCategoriesRequest } from '../../api/category.api';
import {
  createInstructorCourseRequest,
  publishInstructorCourseRequest,
} from '../../api/course.api';
import { CourseForm } from '../../components/courses/CourseForm';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { PageLoader } from '../../components/feedback/PageLoader';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Category, CourseFormRequest } from '../../types/course';
import { getErrorMessage } from '../../utils/errors';

export function CreateCoursePage() {
  useDocumentTitle('Create Course');
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setStatus('loading');

    try {
      setCategories(await listCategoriesRequest());
      setStatus('success');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async (input: CourseFormRequest, publish: boolean) => {
    setIsSubmitting(true);

    try {
      const course = await createInstructorCourseRequest(input);

      if (publish) {
        await publishInstructorCourseRequest(course.id);
        toast.success('Course published successfully.');
      } else {
        toast.success('Draft course saved successfully.');
      }

      navigate('/instructor/courses');
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <PageLoader message="Loading course form" />;
  }

  if (status === 'error') {
    return (
      <ErrorMessage
        action={<Button onClick={() => void load()}>Retry</Button>}
        message={error ?? 'Categories could not be loaded.'}
        title="Unable to prepare course form"
      />
    );
  }

  return (
    <div>
      <header className="mb-6">
        <p className="text-sm font-bold uppercase text-brand-blue">Course builder</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy">Create course</h1>
      </header>
      <CourseForm
        categories={categories}
        isSubmitting={isSubmitting}
        onPublish={(input) => save(input, true)}
        onSaveDraft={(input) => save(input, false)}
      />
    </div>
  );
}
