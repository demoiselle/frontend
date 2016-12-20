import { Component, Input, Output, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'dml-captcha',
    exportAs: 'dmlCaptcha',
    // templateUrl: './captcha.template.html',
    template: `
<div class="dml-captcha--container">
    <input type="hidden" [(ngModel)]="captcha.token" />
    <img alt="Imagem do Captcha" [src]="captcha.image" />
    <button type="button" class="dml-captcha--refresh" (click)="refresh()" title="Recarregar captcha">
        <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="24" viewBox="0 0 24 24" width="24">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
        </svg>
        <!--<span class="sr-only">Recarregar captcha</span>-->
    </button>
    <button type="button" class="dml-captcha--play" (click)="play()" title="Ouvir captcha">
        <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
        <!--<span class="sr-only">Ouvir captcha</span>-->
    </button>
    <label for="dml-captcha--text">Digite os caracteres acima:</label>
    <input type="text" id="dml-captcha--text" [(ngModel)]="captcha.text" />
</div>
`
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
    @Input() public url: string;

    /**
     * Identificador único do cliente do serviço de captcha
     */
    @Input() public clienteId: string;

    /**
     * Sinaliza se o componente está carregando as informações do captcha
     */
    // @Output() 
    public isLoading: Boolean;

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