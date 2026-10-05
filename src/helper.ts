
export function toFormData(obj: Object) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'undefined') {
      continue
    }

    if (value?.file?.originFileObj instanceof File) {
      formData.append(key, value.file.originFileObj)
    } else {
      formData.append(key, value)
    }

  }

  return formData;
}

export function toChunks<T>(arr: T[], size: number) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}
