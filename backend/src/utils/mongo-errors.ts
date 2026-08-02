type DuplicateKeyError = Error & {
  code: 11000;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const hasDuplicateKeyCode = (
  value: Record<string, unknown>,
): value is Record<string, unknown> & { code: 11000 } => value.code === 11000;

export const isDuplicateKeyError = (
  error: unknown,
): error is DuplicateKeyError =>
  isRecord(error) && error instanceof Error && hasDuplicateKeyCode(error);

export const getDuplicateKeyField = (error: DuplicateKeyError): string | null => {
  if (error.keyPattern) {
    const [field] = Object.keys(error.keyPattern);

    if (field) {
      return field;
    }
  }

  if (error.keyValue) {
    const [field] = Object.keys(error.keyValue);

    if (field) {
      return field;
    }
  }

  return null;
};
