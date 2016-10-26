import { Directive, ElementRef, Input, Renderer } from '@angular/core';
import {AuthService} from './auth.service';


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

    constructor(private el: ElementRef, private renderer: Renderer, private authService: AuthService) {

    }

    @Input()
    set dmlHasRolesDisable(roles: string[]) {
        
        if (!this.authService.isAuthorized(roles)) {
            this.disableElement(this.el.nativeElement);
        }
    }

    disableElement(element) {
        let tagName = element.tagName;
        if (tagName === 'INPUT' ||
            tagName === 'SELECT' ||
            tagName === 'TEXTAREA' ||
            tagName === 'BUTTON' ||
            tagName === 'A') {

            this.renderer.setElementAttribute(element, 'disabled', 'true');
        } else {
            
            for(var i = 0; i < element.children.length; i++) {
                this.disableElement(element.children[i]);
            }
        }
    }


}
