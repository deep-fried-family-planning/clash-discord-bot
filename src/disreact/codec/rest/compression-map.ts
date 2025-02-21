export const makeCompressionMap = (obj: any, parentKey = '', result: Record<string, any> = {}): Record<string, any> => {
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;

      if (Array.isArray(obj[key])) {
        obj[key].forEach((item, index) => {
          const arrayKey = `${newKey}[${index}]`;
          if (item !== null && typeof item === 'object') {
            makeCompressionMap(item, arrayKey, result);
          }
          else {
            result[arrayKey] = item;
          }
        });
      }
      else if (obj[key] !== null && typeof obj[key] === 'object') {
        makeCompressionMap(obj[key], newKey, result);
      }
      else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
};
