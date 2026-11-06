import {NdwuButtonComponent} from '@ndw-ui-kit/core';
import {moduleMetadata} from '@storybook/angular';
import {eventArgType} from './arg-types';
import {withStackLayout} from './story-layout';

export interface SubmitArg {
  submit: (entries: Record<string, FormDataEntryValue>) => void;
}

export const submitArgType = eventArgType(
  'submit',
  'Form entries sent on submit; the story keeps the page from navigating',
);

export const submitProps = (args: SubmitArg): {submit: (event: SubmitEvent) => void} => {
  return {
    submit: (event: SubmitEvent) => {
      event.preventDefault();
      args.submit(Object.fromEntries(new FormData(event.target as HTMLFormElement)));
    },
  };
};

export const withNativeForm = [
  withStackLayout,
  moduleMetadata({imports: [NdwuButtonComponent]}),
];
