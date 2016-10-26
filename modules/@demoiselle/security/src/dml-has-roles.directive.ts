import { Directive, TemplateRef, Input, ViewContainerRef } from '@angular/core';
import {AuthService} from './auth.service';


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
	
  constructor(private _viewContainer: ViewContainerRef, private _template: TemplateRef<Object>,  private authService: AuthService) {}


  @Input()
  set dmlHasRoles(roles: string[]) {
    if (this.authService.isAuthorized(roles)) {
      this._viewContainer.createEmbeddedView(this._template);
    } else {
      this._viewContainer.clear();
    }
  }
    
}
