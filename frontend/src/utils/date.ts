export const formatDate = (value?: string | null): string => {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-CM', {
    dateStyle: 'medium',
  }).format(new Date(value));
};
