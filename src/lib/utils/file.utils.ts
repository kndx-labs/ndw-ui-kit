export function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Truncates a file name to fit within a maximum character limit while preserving
 * the file extension. For names exceeding the limit, the middle portion is replaced
 * with an ellipsis. XL size allows 40 characters, other sizes allow 30.
 */
export function shortenFileName(name: string, maxChars: number): string {
  if (name.length <= maxChars) {
    return name;
  }

  const lastDot = name.lastIndexOf('.');

  if (lastDot <= 0) {
    return name.substring(0, maxChars - 3) + '...';
  }

  const extension = name.substring(lastDot);
  const fileNameWithoutExtension = name.substring(0, lastDot);
  const remainingChars = maxChars - 3 - extension.length;

  if (remainingChars <= 4) {
    return name.substring(0, maxChars - 3 - extension.length) + '...' + extension;
  }

  const startChars = Math.ceil(remainingChars / 2);
  const endChars = Math.floor(remainingChars / 2);

  return fileNameWithoutExtension.substring(0, startChars)
    + '...'
    + fileNameWithoutExtension.slice(-endChars)
    + extension;
}
