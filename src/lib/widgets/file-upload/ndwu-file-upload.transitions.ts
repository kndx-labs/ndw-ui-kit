import type {NdwuFileInputValue, NdwuFileProgressUpdate} from './ndwu-file-upload.types';

export type NdwuFileUploadAction =
  | {type: 'add'; files: NdwuFileInputValue[]; multiple: boolean}
  | {type: 'remove'; fileId: string}
  | {type: 'retry'; fileId: string}
  | {type: 'cancel'; fileId: string}
  | {type: 'cancelAll'}
  | {type: 'retryAll'};

export interface NdwuFileUploadTransition {
  files: NdwuFileInputValue[];
  uploadRequests: NdwuFileInputValue[];
  cancelRequests: NdwuFileInputValue[];
}

const isInFlight = (file: NdwuFileInputValue): boolean => {
  return file.status === 'queued' || file.status === 'uploading';
};

const canRetry = (file: NdwuFileInputValue): boolean => {
  return file.status === 'error' && file.isRetryable === true;
};

const requeue = (file: NdwuFileInputValue): NdwuFileInputValue => {
  const {error, isRetryable, ...rest} = file;

  return {...rest, status: 'queued', progress: 0};
};

const cancel = (file: NdwuFileInputValue): NdwuFileInputValue => ({...file, status: 'canceled'});

const replaceWhere = (
  files: NdwuFileInputValue[],
  shouldChange: (file: NdwuFileInputValue) => boolean,
  change: (file: NdwuFileInputValue) => NdwuFileInputValue,
): {files: NdwuFileInputValue[]; changed: NdwuFileInputValue[]} => {
  const changed: NdwuFileInputValue[] = [];
  const next = files.map(file => {
    if (!shouldChange(file)) {
      return file;
    }

    const updated = change(file);

    changed.push(updated);

    return updated;
  });

  return {files: changed.length > 0 ? next : files, changed};
};

export function applyFileUploadAction(
  files: NdwuFileInputValue[],
  action: NdwuFileUploadAction,
): NdwuFileUploadTransition {
  switch (action.type) {
    case 'add': {
      const added = action.multiple ? action.files : action.files.slice(0, 1);

      if (added.length === 0) {
        return {files, uploadRequests: [], cancelRequests: []};
      }

      return {
        files: action.multiple ? [...files, ...added] : added,
        uploadRequests: added.filter(file => file.status === 'queued'),
        cancelRequests: action.multiple ? [] : files.filter(isInFlight),
      };
    }
    case 'remove': {
      const removed = files.find(file => file.id === action.fileId);

      if (!removed) {
        return {files, uploadRequests: [], cancelRequests: []};
      }

      return {
        files: files.filter(file => file !== removed),
        uploadRequests: [],
        cancelRequests: isInFlight(removed) ? [removed] : [],
      };
    }
    case 'retry':
    case 'retryAll': {
      const shouldRetry = action.type === 'retry'
        ? (file: NdwuFileInputValue) => file.id === action.fileId && canRetry(file)
        : canRetry;
      const result = replaceWhere(files, shouldRetry, requeue);

      return {files: result.files, uploadRequests: result.changed, cancelRequests: []};
    }
    case 'cancel':
    case 'cancelAll': {
      const shouldCancel = action.type === 'cancel'
        ? (file: NdwuFileInputValue) => file.id === action.fileId && isInFlight(file)
        : isInFlight;
      const result = replaceWhere(files, shouldCancel, cancel);

      return {files: result.files, uploadRequests: [], cancelRequests: result.changed};
    }
  }
}

export function applyFileProgressUpdate(
  file: NdwuFileInputValue,
  update: NdwuFileProgressUpdate,
): NdwuFileInputValue {
  const updated: NdwuFileInputValue = {
    ...file,
    progress: update.progress ?? file.progress,
    status: update.status ?? file.status,
  };

  if (file.status === 'error' && updated.status !== 'error') {
    delete updated.error;
    delete updated.isRetryable;
  }

  if (update.error !== undefined) {
    updated.error = update.error;
  }

  if (update.isRetryable !== undefined) {
    updated.isRetryable = update.isRetryable;
  }

  return updated;
}
