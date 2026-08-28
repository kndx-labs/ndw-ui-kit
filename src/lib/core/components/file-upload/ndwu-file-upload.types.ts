export type FileUploadStatus = 'queued' | 'uploading' | 'success' | 'error' | 'warning' | 'canceled';

export interface FileInputValue {
  id: string;
  name: string;
  size: number;
  type?: string;
  progress: number;
  status: FileUploadStatus;
  error?: string;
  /** Consumer-driven flag indicating the error is retryable. The library never sets this field. */
  isRetryable?: boolean;
  file?: File;
}

export interface TranslationTexts {
  status?: {
    uploading?: string;
    success?: string;
    warning?: string;
    error?: string;
    canceled?: string;
    queued?: string;
  };
  header?: {
    title?: {
      failed?: string;
      completed?: string;
      canceled?: string;
      inProgress?: string;
    };
    subtitle?: {
      completed?: string;
      canceled?: string;
      inProgress?: string;
    };
    expand?: string;
    collapse?: string;
    cancelAll?: string;
    retry?: string;
  };
  action?: {
    remove?: string;
    cancel?: string;
    retry?: string;
  };
  dropzone?: {
    title?: string;
    hint?: string;
    browse?: string;
  };
  validation?: {
    tooLarge?: string;
  };
}
