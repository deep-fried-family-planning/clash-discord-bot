export const normalizeChildren = <A>(
  children?: null | A | A[],
): A[] => {
  if (!children) {
    return [];
  }
  if (typeof children === 'undefined') {
    return [];
  }
  if (Array.isArray(children)) {
    return children;
  }
  return [children];
};
