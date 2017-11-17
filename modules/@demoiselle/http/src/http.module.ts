import { NgModule, ModuleWithProviders } from '@angular/core';
import { ExceptionService } from './exception.service';

@NgModule({
    declarations: []
})

export class DmlHttpModule {
    static forRoot(): ModuleWithProviders {
        return {
          ngModule: DmlHttpModule,
          providers: [
            ExceptionService
          ]
        };
      }
}
