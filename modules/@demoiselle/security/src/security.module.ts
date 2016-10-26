// imports
import { NgModule } from '@angular/core';
import {AuthService} from './auth.service';
import {AuthGuard} from './auth.guard';
import {DmlIsLoggedDirective} from './dml-is-logged.directive';
import {DmlHasRolesDirective} from './dml-has-roles.directive';
import {DmlHasRolesDisableDirective} from './dml-has-roles-disable.directive';

import { provideAuth, AUTH_PROVIDERS } from 'angular2-jwt';


@NgModule({
    declarations: [
        DmlIsLoggedDirective,
        DmlHasRolesDirective,
        DmlHasRolesDisableDirective
    ],
    providers: [
        AuthService,
        AuthGuard,
        AUTH_PROVIDERS,
        provideAuth({
            headerName: 'Authorization',
            headerPrefix: 'Token ',
            tokenName: 'id_token',
            //tokenGetter: YOUR_TOKEN_GETTER_FUNCTION,
            globalHeaders: [{ 'Content-Type': 'application/json' }],
            noJwtError: false,
            noTokenScheme: false
        })
    ],
    exports: [
        DmlIsLoggedDirective,
        DmlHasRolesDirective,
        DmlHasRolesDisableDirective
    ]

})
export class SecurityModule {

}
