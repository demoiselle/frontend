import { NgModule, ModuleWithProviders } from '@angular/core';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { AuthGuard } from './auth.guard';
import { DmlIsLoggedDirective } from './dml-is-logged.directive';
import { DmlHasRolesDirective } from './dml-has-roles.directive';
import { DmlHasRolesDisableDirective } from './dml-has-roles-disable.directive';
import { AuthOptions } from './auth-options';


@NgModule({
    declarations: [
        DmlIsLoggedDirective,
        DmlHasRolesDirective,
        DmlHasRolesDisableDirective
    ],
    exports: [
        DmlIsLoggedDirective,
        DmlHasRolesDirective,
        DmlHasRolesDisableDirective
    ]
})

export class SecurityModule {
    static forRoot(): ModuleWithProviders {
        return {
          ngModule: SecurityModule,
          providers: [
            AuthGuard,
            TokenService,
            AuthOptions,
            AuthService
          ]
        };
      }
}
