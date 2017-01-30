import { Directive, TemplateRef, Input, ViewContainerRef } from '@angular/core';
import { AuthService } from './auth.service';
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

  loginSubscription: Subscription;
  private context: DmlHasRolesContext = new DmlHasRolesContext();
  
  constructor(private _viewContainer: ViewContainerRef, private _template: TemplateRef<Object>, private authService: AuthService) {
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
      this._viewContainer.clear();
      if (this.authService.isAuthorized(this.context.$roles)) {
        this._viewContainer.createEmbeddedView(this._template);
      }
    }
  }

}

export class DmlHasRolesContext { public $roles: string[] = null; }