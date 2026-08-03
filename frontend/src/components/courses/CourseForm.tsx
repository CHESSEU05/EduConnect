import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '../common/Button';
import { Checkbox } from '../common/Checkbox';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { FormField } from '../forms/FormField';
import type { Category, Course, CourseFormRequest, CourseModuleInput } from '../../types/course';

type CourseFormProps = {
  categories: Category[];
  course?: Course | null;
  isSubmitting: boolean;
  onSaveDraft: (input: CourseFormRequest) => Promise<void>;
  onPublish: (input: CourseFormRequest) => Promise<void>;
};

const emptyModule = (): CourseModuleInput => ({
  title: '',
  description: '',
  textContent: '',
  videoUrl: '',
  resourceUrl: '',
  isPreview: false,
});

const emptyForm: CourseFormRequest = {
  title: '',
  shortDescription: '',
  description: '',
  categoryId: '',
  level: 'beginner',
  language: 'English',
  thumbnailUrl: null,
  isFree: true,
  price: 0,
  modules: [emptyModule()],
};

export function CourseForm({
  categories,
  course,
  isSubmitting,
  onPublish,
  onSaveDraft,
}: CourseFormProps) {
  const [form, setForm] = useState<CourseFormRequest>(emptyForm);
  const [priceValue, setPriceValue] = useState(String(emptyForm.price));
  const [pendingPublishInput, setPendingPublishInput] =
    useState<CourseFormRequest | null>(null);

  useEffect(() => {
    if (!course) {
      setForm(emptyForm);
      setPriceValue(String(emptyForm.price));
      return;
    }

    setForm({
      title: course.title,
      shortDescription: course.shortDescription,
      description: course.description ?? '',
      categoryId: course.category.id,
      level: course.level,
      language: course.language,
      thumbnailUrl: course.thumbnailUrl,
      isFree: course.isFree,
      price: course.isFree ? 0 : course.price,
      modules:
        course.modules?.map((module) => ({
          title: module.title,
          description: module.description ?? '',
          textContent: module.textContent ?? '',
          videoUrl: module.videoUrl ?? '',
          resourceUrl: module.resourceUrl ?? '',
          isPreview: module.isPreview,
        })) ?? [emptyModule()],
    });
    setPriceValue(String(course.isFree ? 0 : course.price));
  }, [course]);

  const update = <Key extends keyof CourseFormRequest>(
    key: Key,
    value: CourseFormRequest[Key],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: key === 'isFree' && value === true ? true : value,
      price: key === 'isFree' && value === true ? 0 : current.price,
    }));
  };

  const updateModule = (
    index: number,
    key: keyof CourseModuleInput,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      modules: current.modules.map((module, moduleIndex) =>
        moduleIndex === index ? { ...module, [key]: value } : module,
      ),
    }));
  };

  const setPricingMode = (isFree: boolean) => {
    setForm((current) => ({
      ...current,
      isFree,
      price: isFree ? 0 : current.price > 0 ? current.price : 10000,
    }));
    setPriceValue((current) => {
      if (isFree) {
        return '0';
      }

      return Number(current) > 0 ? current : '10000';
    });
  };

  const updatePrice = (value: string) => {
    setPriceValue(value);

    if (value === '') {
      setForm((current) => ({ ...current, price: 0 }));
      return;
    }

    const parsedPrice = Number(value);

    if (Number.isFinite(parsedPrice)) {
      setForm((current) => ({ ...current, price: parsedPrice }));
    }
  };

  const moveModule = (index: number, direction: -1 | 1) => {
    setForm((current) => {
      const nextModules = [...current.modules];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= nextModules.length) {
        return current;
      }

      const [module] = nextModules.splice(index, 1);
      nextModules.splice(targetIndex, 0, module);

      return { ...current, modules: nextModules };
    });
  };

  const submit = (mode: 'draft' | 'publish') => {
    const normalized: CourseFormRequest = {
      ...form,
      price: form.isFree ? 0 : Number(form.price),
      thumbnailUrl: form.thumbnailUrl || null,
      modules: form.modules.map((module) => ({
        ...module,
        description: module.description || null,
        textContent: module.textContent || null,
        videoUrl: module.videoUrl || null,
        resourceUrl: module.resourceUrl || null,
      })),
    };

    if (mode === 'publish') {
      setPendingPublishInput(normalized);
      return;
    }

    void onSaveDraft(normalized);
  };

  const confirmPublish = () => {
    if (!pendingPublishInput) {
      return;
    }

    const input = pendingPublishInput;
    setPendingPublishInput(null);
    void onPublish(input);
  };

  return (
    <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-bold text-brand-navy">Basic information</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormField htmlFor="title" label="Course title">
            <Input
              id="title"
              onChange={(event) => update('title', event.target.value)}
              value={form.title}
            />
          </FormField>
          <FormField htmlFor="category" label="Category">
            <Select
              id="category"
              onChange={(event) => update('categoryId', event.target.value)}
              value={form.categoryId}
            >
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="shortDescription" label="Short description">
            <Textarea
              id="shortDescription"
              onChange={(event) => update('shortDescription', event.target.value)}
              value={form.shortDescription}
            />
          </FormField>
          <FormField htmlFor="description" label="Full description">
            <Textarea
              id="description"
              onChange={(event) => update('description', event.target.value)}
              value={form.description}
            />
          </FormField>
          <FormField htmlFor="level" label="Level">
            <Select
              id="level"
              onChange={(event) =>
                update('level', event.target.value as CourseFormRequest['level'])
              }
              value={form.level}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="all-levels">All levels</option>
            </Select>
          </FormField>
          <FormField htmlFor="language" label="Language">
            <Input
              id="language"
              onChange={(event) => update('language', event.target.value)}
              value={form.language}
            />
          </FormField>
          <FormField htmlFor="thumbnailUrl" label="Thumbnail URL">
            <Input
              id="thumbnailUrl"
              onChange={(event) => update('thumbnailUrl', event.target.value)}
              value={form.thumbnailUrl ?? ''}
            />
          </FormField>
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-text-primary">Pricing</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <button
                className={`rounded-md border p-4 text-left transition ${
                  form.isFree
                    ? 'border-brand-green bg-emerald-50 text-brand-navy ring-2 ring-emerald-100'
                    : 'border-slate-200 bg-white text-text-secondary hover:border-brand-green'
                }`}
                onClick={() => setPricingMode(true)}
                type="button"
              >
                <span className="block text-sm font-extrabold">Free course</span>
                <span className="mt-1 block text-xs font-semibold">
                  Best for previews, community courses, and introductory content.
                </span>
              </button>
              <button
                className={`rounded-md border p-4 text-left transition ${
                  !form.isFree
                    ? 'border-brand-blue bg-primary-50 text-brand-navy ring-2 ring-blue-100'
                    : 'border-slate-200 bg-white text-text-secondary hover:border-brand-blue'
                }`}
                onClick={() => setPricingMode(false)}
                type="button"
              >
                <span className="block text-sm font-extrabold">Paid course</span>
                <span className="mt-1 block text-xs font-semibold">
                  Display a course price in XAF without payment processing.
                </span>
              </button>
            </div>
            {!form.isFree ? (
              <div className="mt-4 max-w-sm">
                <FormField htmlFor="price" label="Price in XAF">
                  <Input
                    id="price"
                    min={0}
                    onChange={(event) => updatePrice(event.target.value)}
                    type="number"
                    value={priceValue}
                  />
                </FormField>
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-brand-navy">Course modules</h2>
          <Button
            onClick={() =>
              setForm((current) => ({
                ...current,
                modules: [...current.modules, emptyModule()],
              }))
            }
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Add module
          </Button>
        </div>
        <div className="mt-4 space-y-4">
          {form.modules.map((module, index) => (
            <div className="rounded-lg border border-slate-200 p-4" key={index}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-bold text-brand-navy">Module {index + 1}</p>
                <div className="flex gap-1">
                  <Button onClick={() => moveModule(index, -1)} variant="ghost">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => moveModule(index, 1)} variant="ghost">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        modules: current.modules.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  aria-label="Module title"
                  onChange={(event) => updateModule(index, 'title', event.target.value)}
                  placeholder="Module title"
                  value={module.title}
                />
                <Input
                  aria-label="Module video URL"
                  onChange={(event) => updateModule(index, 'videoUrl', event.target.value)}
                  placeholder="External video URL"
                  value={module.videoUrl ?? ''}
                />
                <Textarea
                  aria-label="Module description"
                  onChange={(event) => updateModule(index, 'description', event.target.value)}
                  placeholder="Description"
                  value={module.description ?? ''}
                />
                <Textarea
                  aria-label="Text content"
                  onChange={(event) => updateModule(index, 'textContent', event.target.value)}
                  placeholder="Text content"
                  value={module.textContent ?? ''}
                />
                <Input
                  aria-label="Resource URL"
                  onChange={(event) => updateModule(index, 'resourceUrl', event.target.value)}
                  placeholder="Resource URL"
                  value={module.resourceUrl ?? ''}
                />
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <Checkbox
                    checked={module.isPreview}
                    onChange={(event) =>
                      updateModule(index, 'isPreview', event.target.checked)
                    }
                  />
                  Allow public preview
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button disabled={isSubmitting} onClick={() => submit('draft')} variant="outline">
          {isSubmitting ? 'Saving...' : 'Save draft'}
        </Button>
        <Button disabled={isSubmitting} onClick={() => submit('publish')}>
          {isSubmitting ? 'Publishing...' : 'Publish course'}
        </Button>
      </div>
      <ConfirmDialog
        confirmLabel="Publish course"
        isLoading={isSubmitting}
        isOpen={Boolean(pendingPublishInput)}
        message="Once published, this course can appear to students in the public catalogue."
        onCancel={() => setPendingPublishInput(null)}
        onConfirm={confirmPublish}
        title="Publish this course?"
      />
    </form>
  );
}
