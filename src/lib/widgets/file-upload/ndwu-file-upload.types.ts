export type NdwuFileUploadStatus = 'queued' | 'uploading' | 'success' | 'error' | 'warning' | 'canceled';

export interface NdwuFileInputValue {
  id: string;
  name: string;
  size: number;
  type?: string;
  progress: number;
  status: NdwuFileUploadStatus;
  error?: string;
  /** Consumer-driven flag indicating the error is retryable. The library never sets this field. */
  isRetryable?: boolean;
  file?: File;
}

export interface NdwuTranslationTexts {
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
