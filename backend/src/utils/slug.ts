export const createSlug = (value: string): string => {
  const normalizedValue = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedValue || "item";
};

export const resolveSlugCollision = async (
  baseValue: string,
  exists: (candidateSlug: string) => Promise<boolean>,
): Promise<string> => {
  const baseSlug = createSlug(baseValue);
  let candidateSlug = baseSlug;
  let suffix = 2;

  while (await exists(candidateSlug)) {
    candidateSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidateSlug;
};
