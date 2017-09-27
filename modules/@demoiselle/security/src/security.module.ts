import { NgModule } from '@angular/core';
// import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { DmlIsLoggedDirective } from './dml-is-logged.directive';
import { DmlHasRolesDirective } from './dml-has-roles.directive';
import { DmlHasRolesDisableDirective } from './dml-has-roles-disable.directive';

import { provideAuth, AUTH_PROVIDERS } from 'angular2-jwt';


@NgModule({
    declarations: [
        DmlIsLoggedDirective,
        DmlHasRolesDirective,
        DmlHasRolesDisableDirective
    ],
    providers: [
        // AuthService,
        AuthGuard
    ],
    exports: [
        DmlIsLoggedDirective,
        DmlHasRolesDirective,
        DmlHasRolesDisableDirective
    ]
})

export class SecurityModule {
}
