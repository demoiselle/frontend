import { Component } from '@angular/core';
import { Http } from '@angular/http';

@Component({
    selector: 'dml-captcha',
    templateUrl: './captcha.template.html'
})

export class CaptchaComponent {

    /**
     * campo oculto para controle do captcha pelo serviço
     * ref.: "txtToken_captcha_serpro_gov_br"
     */
    token = '';

    /**
     * campo de input do usuário
     * ref.: "txtTexto_captcha_serpro_gov_br"
     */
    texto = '';

    /**
     * Endereço de gerenciamento do captcha.
     * 
     * Utilizado para:
     * - carregar a imagem;
     * - carregar o áudio;
     */
    url = '';

    /**
     * Identificador único do cliente.
     */
    clienteId = '';

    constructor(public http: Http) {
    }


    _load() {
        let url = '/captcha/1.0.0/imagem';
        let body = this.clienteId;
        this.http.post(url, body)
        .subscribe(
            data => this.handleSuccess(data),
            err => console.error('Houve um erro:' + err)
        );

        function handleSuccess(data) {
            // TODO: implement
        }
    }

    /**
     * Carrega um novo catpcha
     */
    refresh(): void {
        // 
    }

    play(): void {
        // TODO: tocar música
    }

    // /**
    //  * APENAS PARA TESTES - Valida o captcha
    //  */
    // _validate() {

    // }
}