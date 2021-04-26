export const resolveRef = (
  spec: Record<string, any>,
  ref: string
): Record<string, any> => {
  const parts = ref.split('/');

  if (parts.length <= 1) {
    return {};
  }

  const recursive = (
    obj: Record<string, any>,
    idx: number
  ): Record<string, any> => {
    if (idx + 1 < parts.length) {
      const newCount = idx + 1;

      return recursive(obj[parts[idx]], newCount);
    }

    return obj[parts[idx]];
  };

  return recursive(spec, 1);
};
