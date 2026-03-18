export const downloadBlob = (data: BlobPart, fileName: string, mimeType?: string) => {
  const blob = data instanceof Blob
    ? data
    : new Blob([data], mimeType ? { type: mimeType } : undefined);

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const escapeCsvCell = (value: unknown) => {
  const normalized = String(value ?? '');
  if (/[",\r\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
};

export const downloadCsv = (rows: Array<Array<unknown>>, fileName: string) => {
  const content = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
  downloadBlob(content, fileName, 'text/csv;charset=utf-8');
};

export const extractApiErrorMessage = async (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const responseData = (error as { response?: { data?: unknown } }).response?.data;
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData.trim();
  }

  if (responseData && typeof responseData === 'object' && 'message' in responseData) {
    const message = (responseData as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }

  if (responseData instanceof Blob) {
    try {
      const text = (await responseData.text()).trim();
      if (!text) {
        return fallback;
      }

      try {
        const parsed = JSON.parse(text) as { message?: unknown };
        if (typeof parsed.message === 'string' && parsed.message.trim()) {
          return parsed.message.trim();
        }
      } catch {
        return text;
      }

      return text;
    } catch {
      return fallback;
    }
  }

  const message = (error as { message?: unknown }).message;
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  return fallback;
};
