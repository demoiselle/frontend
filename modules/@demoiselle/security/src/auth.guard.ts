import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { AuthService } from './auth.service';
import { TokenService } from './token.service';

/**
 * Serviço que intercepta acesso as rotas e redireciona para a página de login
 * caso o usuário não esteja autenticado. Deve ser utilizado na configuração de rotas
 * da seguinte forma:
 *
 * {
    path: '/home',
    ...
    canActivate: [AuthGuard]
  },
 *
 *
 */
@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private authService: AuthService, private tokenService: TokenService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if (this.authService.isAuthenticated()) {
            if (route.data && route.data.roles && !this.authService.isAuthorized(route.data.roles)) {
              throw new Error('Not Authorized. The user roles do not match any of expected route roles');
            } else {
              // logged in so return true
              return true;
            }
        }

        let url: string = state.url;
        this.authService.redirectUrl = url;

        let loginRoute = this.authService.getLoginRoute();
        let typeOfLoginRoute = (typeof loginRoute);
        switch (typeOfLoginRoute) {
            case 'function':
                loginRoute();
                break;
            // case 'string':
            default:
                this.router.navigate([loginRoute]);
                break;
        }

        return false;
    }
}
