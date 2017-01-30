import { Directive, TemplateRef, Input, ViewContainerRef } from '@angular/core';
import { AuthService } from './auth.service';
import { Subscription } from 'rxjs/Subscription';


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

  loginSubscription: Subscription;
	
  constructor(private _viewContainer: ViewContainerRef, private _template: TemplateRef<Object>,  private authService: AuthService) {
    this.loginSubscription = this.authService.loginChange$.subscribe(
      token => this.updateView()
    );
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
  }


  @Input()
  set dmlIsLogged(empty: any) {
    this.updateView();
  }

  private updateView(){
    this._viewContainer.clear();
    if (this.authService.isAuthenticated()) {
      this._viewContainer.createEmbeddedView(this._template);
    }
  }

}
