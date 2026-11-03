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

interface ReplaceResult {
  files: NdwuFileInputValue[];
  changed: NdwuFileInputValue[];
}

const isInFlight = (file: NdwuFileInputValue): boolean => {
  return file.status === 'queued' || file.status === 'uploading';
};

export const canRetry = (file: NdwuFileInputValue): boolean => {
  return file.status === 'error' && file.isRetryable === true;
};

const requeue = (file: NdwuFileInputValue): NdwuFileInputValue => {
  const {error, isRetryable, ...rest} = file;

  return {...rest, status: 'queued', progress: 0};
};

const cancel = (file: NdwuFileInputValue): NdwuFileInputValue => {
  return {...file, status: 'canceled'};
};

const byId = (
  fileId: string,
  rule: (file: NdwuFileInputValue) => boolean,
): ((file: NdwuFileInputValue) => boolean) => {
  return file => file.id === fileId && rule(file);
};

const replaceWhere = (
  files: NdwuFileInputValue[],
  shouldChange: (file: NdwuFileInputValue) => boolean,
  change: (file: NdwuFileInputValue) => NdwuFileInputValue,
): ReplaceResult => {
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

const retried = ({files, changed}: ReplaceResult): NdwuFileUploadTransition => {
  return {files, uploadRequests: changed, cancelRequests: []};
};

const canceled = ({files, changed}: ReplaceResult): NdwuFileUploadTransition => {
  return {files, uploadRequests: [], cancelRequests: changed};
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
      return retried(replaceWhere(files, byId(action.fileId, canRetry), requeue));
    case 'retryAll':
      return retried(replaceWhere(files, canRetry, requeue));
    case 'cancel':
      return canceled(replaceWhere(files, byId(action.fileId, isInFlight), cancel));
    case 'cancelAll':
      return canceled(replaceWhere(files, isInFlight, cancel));
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
