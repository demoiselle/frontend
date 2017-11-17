import { Directive, ElementRef, Input, Renderer } from '@angular/core';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { Subscription } from 'rxjs/Subscription';


/**
 * Desabilita elmentos (uma porção do DOM) caso o usuário não tenha um dos perfis informados.
 * Os perfis devem ser declarados como um array de strings
 *
 * ```
 * <div [dmlHasRolesDisable]="['ADMINISTRADOR']">
 *    <input type="text" value="desabilitado caso não seja administrador" />
 *    <a href=""> Link </a>
 * </div>
 * ```
 *
 * ### Syntax
 *
 * `<input type="text" [dmlHasRolesDisable]="['ADMINISTRADOR','USUARIO']"/>`
 *
 */
@Directive({
    selector: '[dmlHasRolesDisable]'
})
export class DmlHasRolesDisableDirective {
    loginSubscription: Subscription;
    private context: DmlHasRolesDisableContext = new DmlHasRolesDisableContext();

    constructor(private el: ElementRef, private renderer: Renderer, private authService: AuthService, private tokenService: TokenService) {
        this.loginSubscription = this.authService.loginChange$.subscribe(
            token => this.updateView()
        );
    }

    @Input()
    set dmlHasRolesDisable(roles: string[]) {
        this.context.$roles = roles;
        this.updateView();
    }

    private updateView() {
        if (this.context.$roles != null) {
            let disabled = !this.tokenService.isAuthorized(this.context.$roles);
            this.setElementDisabled(this.el.nativeElement, disabled); 
        }
    }

    setElementDisabled(element: any, disabled: boolean) {
        let tagName = element.tagName;
        if (tagName === 'INPUT' ||
            tagName === 'SELECT' ||
            tagName === 'TEXTAREA' ||
            tagName === 'BUTTON' ||
            tagName === 'A') {

            if (disabled) {
                this.renderer.setElementAttribute(element, 'disabled', 'true');
            } else {
                this.renderer.setElementAttribute(element, 'disabled', null);
            }
            
        } else {

            for (let i = 0; i < element.children.length; i++) {
                this.setElementDisabled(element.children[i], disabled);
            }
        }
    }

}

export class DmlHasRolesDisableContext { public $roles: string[] = null; }
