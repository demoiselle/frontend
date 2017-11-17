import { Directive, TemplateRef, Input, ViewContainerRef } from '@angular/core';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { Subscription } from 'rxjs/Subscription';


/**
 * Remove um elemento (uma porção do DOM) caso o usuário não esteja autenticado. 
 *
 * ```
 * <div *dmlIsLogged>
 *  Somente usuário logado pode ver esse conteúdo!!!
 * </div>
 * <div *dmlIsLogged="false">
 *  Somente se não estiver logado pode ver esse conteúdo!!!
 * </div>
 * ```
 *
 * ### Syntax
 *
 * `<div *dmlIsLogged[="true|false"]>...</div>`
 *
 */
@Directive({
  selector: '[dmlIsLogged]'
})
export class DmlIsLoggedDirective {
  private enabled: boolean = true; // indica se é para mostrar caso esteja logado (true) ou não logado (false)
  private hasView: boolean = false; // indica se a porção do DOM está visível ou não

  loginSubscription: Subscription;
	
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
  set dmlIsLogged( enabled: boolean ) {
    // se o atributo enabled não for definido então define o valor padrão como true, ou seja, exibe se estiver logado
    this.enabled = ( enabled === null || enabled === undefined ) || enabled;
    this.updateView();
  }

  private updateView() {
    if ( ( ( !this.tokenService.isAuthenticated() ) ? this.enabled : !this.enabled ) && this.hasView ) {
      /* se a porção do DOM estiver visível então esconde se
       * 1) não estiver autenticado e enabled=true
       * 2) estiver autenticado e enabled=false
       */
      this._viewContainer.clear();
      this.hasView = false;
    } else if ( ( this.tokenService.isAuthenticated() ? this.enabled : !this.enabled ) && !this.hasView ) {
      /* se a porção do DOM não estiver visível, então torna visível se
       * 1) estiver autenticado e enabled=true
       * 2) não estiver autenticado e enabled=false
       */
      this._viewContainer.createEmbeddedView( this._template );
      this.hasView = true;
    }
  }

}
