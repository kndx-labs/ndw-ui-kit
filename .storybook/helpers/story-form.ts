import {NdwuButtonComponent} from '@ndw-ui-kit/core';
import {moduleMetadata} from '@storybook/angular';
import {eventArgType} from './arg-types';
import {withStackLayout} from './story-layout';
import {lines} from './story-template';

export interface SubmitArg {
  submit: (entries: [string, FormDataEntryValue][]) => void;
}

const SUBMIT_BUTTON = '<button ndwu-button type="submit" label="Submit"></button>';

export const submitArgType = eventArgType(
  'submit',
  'Form entries sent on submit; the story keeps the page from navigating',
);

export const submitProps = (args: SubmitArg): {submit: (event: SubmitEvent) => void} => {
  return {
    submit: (event: SubmitEvent) => {
      event.preventDefault();
      args.submit([...new FormData(event.target as HTMLFormElement)]);
    },
  };
};

export const nativeFormTemplate = (fields: readonly string[]): string => {
  return `<form (submit)="submit($event)">\n${lines([...fields, SUBMIT_BUTTON])}\n</form>`;
};

export const withNativeForm = [
  withStackLayout,
  moduleMetadata({imports: [NdwuButtonComponent]}),
];
