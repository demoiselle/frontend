import { NgModule } from '@angular/core';
import { HttpServiceProvider } from './http.service';

@NgModule({
    declarations: [],
    providers: [
        HttpServiceProvider({
            'endpoints': {
                'main': 'http://localhost:9090'
            },
            'multitenancy': {
                'active': false
            },
            'unAuthorizedRoute': '/login',
            'forbiddenRoute': '/login',
            'tokenKey': 'id_token'
        })
    ]
})

export class DmlHttpModule {
}
