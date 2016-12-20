import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'dml-captcha',
    templateUrl: './captcha.template.html',
    styleUrls: ['./captcha.component.scss']
})

export class Captcha {

    /**
     * Imagem em Base64
     */
    image: string;

    /**
     * Campo oculto para controle do captcha pelo serviço
     */
    token: string;
}

export class CaptchaComponent implements OnInit {

    /**
     * Captcha Model
     */
    captcha: Captcha;

    /**
     * Endereço do serviço de captcha
     */
    url = '';

    /**
     * Identificador único do cliente do serviço de captcha
     */
    clienteId = '';

    /**
     * Sinaliza se o componente está carregando as informações do captcha
     */
    isLoading = false;

    // Referências para os elementos HTML do Component
    private audioEl: HTMLAudioElement;
    @ViewChild('dml-captcha--container') containerEl: HTMLElement;
    @ViewChild('dml-captcha--text') inputEl: HTMLInputElement;

    constructor(public http: Http) { }

    ngOnInit(): void {
        this.loadCaptcha();
    }

    // ngOnDestroy() {}
    // ngDoCheck() {}
    // ngOnChanges(changes) {}
    // ngAfterContentInit() {}
    // ngAfterContentChecked() {}
    // ngAfterViewInit() {}
    // ngAfterViewChecked() {}


    refresh(): void {
        this.loadCaptcha();
    }

    /**
     * Carrega um novo captcha (token e imagem)
     */
    loadCaptcha(): void {
        const componentRef = this;

        const url = '/captcha/1.0.0/imagem';
        const body = this.clienteId;

        // Começa a carregar os dados
        componentRef.isLoading = true;

        this.http.post(url, body).subscribe(
            res => handleSuccess,
            err => console.error('Erro ao atualizar captcha.', err),
            () => componentRef.isLoading = false
        );

        function handleSuccess(res: Response) {
            const resposta = res.text();
            const tempMatriz = resposta.split('@');

            // Atualiza a imagem do novo captcha
            componentRef.captcha.image = 'data:image/png;base64,' + tempMatriz[1];

            // Atualiza o token da nova imagem carregada
            componentRef.captcha.token = tempMatriz[0];

            // Limpa o campo de input
            componentRef.inputEl.value = null;

            // Foca no campo de input
            componentRef.inputEl.focus();
        }

    }

    /**
     * Carrega e reproduz o som do captcha.
     */
    play(): void {

        // Carrega e inclui um elemento de audio uma única vez (por componente)
        if (!this.audioEl) {
            this.audioEl = document.createElement("audio");
            this.containerEl.appendChild(this.audioEl);
        }

        this.audioEl.src = '/captcha/2.0.0/som/som.wav?' + this.captcha.token;
        this.audioEl.load();
        this.audioEl.play();
    }

    // /**
    //  * APENAS PARA TESTES - Valida o captcha
    //  */
    _validate() {

        const url = '/captchavalidar/1.0.0/validar';
        const body = {
            clienteId: this.clienteId,
            tokenCaptcha: this.captcha.token,
            texto: this.inputEl.value
        };

        this.http.post(url, body).subscribe(
            res => handleSuccess,
            err => console.error('Erro ao validar captcha.', err)
        );

        function handleSuccess(res: Response) {
            let resultToken = false;

            switch (res.text()) {
                case '1':
                    console.info('Captcha validado com sucesso.');
                    resultToken = true;
                    break;
                case '2':
                    console.warn('Token não encontrado.');
                default:
                    console.error('Captcha incorreto.');
                    break;
            }

            return resultToken;
        }

    }
}