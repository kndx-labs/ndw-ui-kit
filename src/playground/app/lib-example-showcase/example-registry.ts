import type {Type} from '@angular/core';
import type {ExampleName} from '@app/app.types';
import {UserProfileFormExampleComponent} from './user-profile-form/user-profile-form-example.component';

export const EXAMPLE_COMPONENTS: Record<ExampleName, Type<unknown>> = {
  'user-profile-form': UserProfileFormExampleComponent,
};
