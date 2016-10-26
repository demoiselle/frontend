import { Directive, TemplateRef, Input, ViewContainerRef } from '@angular/core';
import {AuthService} from './auth.service';


/**
 * Remove um elemento (uma porção do DOM) caso o usuário não esteja autenticado. 
 *
 * ```
 * <div *dmlIsLogged>
 *    Somente usuário logado pode ver esse conteúdo!!!
 * </div>
 * ```
 *
 * ### Syntax
 *
 * `<div *dmlIsLogged>...</div>`
 *
 */
@Directive({
  selector: '[dmlIsLogged]'
})
export class DmlIsLoggedDirective {
	
  constructor(private _viewContainer: ViewContainerRef, private _template: TemplateRef<Object>,  private authService: AuthService) {}


  @Input()
  set dmlIsLogged(empty: any) {
    if (this.authService.isAuthenticated()) {
      this._viewContainer.createEmbeddedView(this._template);
    } else {
      this._viewContainer.clear();
    }
  }
    
}
