import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { CaptchaComponent } from './captcha.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule
    ],
    declarations: [
        CaptchaComponent
    ],
    bootstrap: [CaptchaComponent]
})
export class CaptchaModule { }
