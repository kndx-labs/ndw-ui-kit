import {Directive} from '@angular/core';
import {CdkColumnDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuColumnDef]',
  inputs: [{name: 'name', alias: 'ndwuColumnDef'}],
  providers: [{provide: CdkColumnDef, useExisting: NdwuColumnDef}],
})
export class NdwuColumnDef extends CdkColumnDef {}
