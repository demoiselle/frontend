import { Directive, TemplateRef, Input, ViewContainerRef } from '@angular/core';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { Subscription } from 'rxjs/Subscription';


/**
 * Remove um elemento (uma porção do DOM) caso o usuário não tenha um dos perfis informados.
 * Os perfis devem ser declarados como um array de strings
 *
 * ```
 * <div *dmlHasRoles="['ADMINISTRADOR']">
 *    Somente usuário com perfil administrador pode ver esse conteúdo!!!
 * </div>
 * ```
 *
 * ### Syntax
 *
 * `<div *dmlHasRoles="['ADMINISTRADOR','USUARIO']">...</div>`
 *
 */
@Directive({
  selector: '[dmlHasRoles]'
})
export class DmlHasRolesDirective {
  private hasView: boolean = false; // indica se a porção do DOM está visível ou não

  loginSubscription: Subscription;
  private context: DmlHasRolesContext = new DmlHasRolesContext();
  
  constructor(
    private _viewContainer: ViewContainerRef,
    private _template: TemplateRef<Object>,
    private authService: AuthService,
    private tokenService: TokenService) {
      this.loginSubscription = this.authService.loginChange$.subscribe(
        token => this.updateView()
      );
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
  }

  @Input()
  set dmlHasRoles(roles: string[]) {
    this.context.$roles = roles;
    this.updateView();
  }

  private updateView() {
    if (this.context.$roles != null) {
      if ( !this.tokenService.isAuthorized( this.context.$roles ) && this.hasView ) {
        this._viewContainer.clear();
        this.hasView = false;
      } else if ( this.tokenService.isAuthorized( this.context.$roles ) && !this.hasView ) {
        this._viewContainer.createEmbeddedView( this._template );
        this.hasView = true;
      }
    }
  }

}

export class DmlHasRolesContext { public $roles: string[] = null; }