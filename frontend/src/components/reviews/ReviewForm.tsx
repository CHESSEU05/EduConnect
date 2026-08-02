import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { FormField } from '../forms/FormField';
import { StarRatingInput } from './StarRatingInput';
import {
  reviewFormSchema,
  type ReviewFormValues,
} from '../../schemas/review.schemas';

type ReviewFormProps = {
  initialValues?: ReviewFormValues;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: ReviewFormValues) => Promise<void>;
};

export function ReviewForm({
  initialValues = { rating: 5, comment: '' },
  isSubmitting = false,
  onSubmit,
  submitLabel = 'Submit review',
}: ReviewFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
    register,
  } = useForm<ReviewFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(reviewFormSchema),
  });

  const rating = watch('rating');

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <FormField error={errors.rating?.message} htmlFor="rating" label="Rating">
        <StarRatingInput
          onChange={(nextRating) =>
            setValue('rating', nextRating, { shouldValidate: true })
          }
          value={rating}
        />
      </FormField>
      <FormField error={errors.comment?.message} htmlFor="comment" label="Comment">
        <Textarea id="comment" {...register('comment')} />
      </FormField>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
