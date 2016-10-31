import { NgModule } from '@angular/core';
import { HttpService, HttpServiceProvider } from './http.service';


@NgModule({
    declarations: [],
    providers: [
        HttpServiceProvider({
            'main' : 'http://localhost:9090'
        })
        
    ]
    

})
export class DmlHttpModule {

}