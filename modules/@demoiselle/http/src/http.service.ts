import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, ConnectionBackend, RequestOptionsArgs, Response, XHRBackend} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import { Request } from '@angular/http/src/static_request';
//import { tokenNotExpired, JwtHelper, AuthHttp } from 'angular2-jwt';

@Injectable()
export class HttpService extends Http {
    
    /**
     * Constructor
     * 
     * Endpoint structure:
     * {
     *      'endpoint1' : 'http://endpoint1.com',
     *      'endpoint2' : 'http://endpoint2.com',
     * }
     * 
     */
    constructor(_backend: ConnectionBackend, _defaultOptions: RequestOptions, private endpoints: any) {
        super(_backend, _defaultOptions);
        let jwtHeader = localStorage.getItem('id_token');
        if (jwtHeader != null) {
            this._defaultOptions.headers.append('Authorization', 'Token ' + jwtHeader);
        }
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        url = this.appendEndpoint(url);
        return this.intercept(super.post(url, body, options));

    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        url = this.appendEndpoint(url);
        return this.intercept(super.get(url, options));
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        url = this.appendEndpoint(url);
        return this.intercept(super.put(url, body, options));
    }
    /**
     * Performs a request with `delete` http method.
     */
    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        url = this.appendEndpoint(url);
        return this.intercept(super.delete(url, options));
    }

    intercept(observable: Observable<Response>): Observable<Response> {
        return observable.catch((err, source) => {
			if (err.status  == 401) { // && !_.endsWith(err.url, '/login')) {
                //this._router.navigate(['/login']);
                return Observable.empty();
            } else if (err.status  == 412 || err.status == 422) {
                alert('Erro de validação! Favor corrigir os campos com problema');
                return Observable.throw(err);
            } else {
                return Observable.throw(err);
			}
        });

    }

    /**
     * Append endpoint url according to endpoints configuration
     * Rules:
     * 
     * Url 'http://someurl'             => Url is not changed
     * Url '~endpoint1/api/resource'    => endpoint1's url concatenated with 'api/resource'
     * Url 'api/resource'               => first endpoint url concatenated with 'api/resource' (ideal for single endpoint config)
     */
    private appendEndpoint(url: string) : string {
        if (!(url.lastIndexOf('http', 0) === 0)) { // startsWith in ES5
            if (url.lastIndexOf('~', 0) === 0) { // startsWith in ES5
                let apiUrl = url.substring(url.indexOf('/')+1);
                let endpoint = url.substring(1, url.indexOf('/'));
                if (this.endpoints.hasOwnProperty(endpoint)) {

                    if(endpoint.toLowerCase() == 'multitenancy') {
                        return this.endpoints[endpoint] + apiUrl;
                    } else {
                        if(localStorage.getItem('dml_tenant')) {
                            return this.endpoints[endpoint] + 
                                JSON.parse(localStorage.getItem('dml_tenant')).name + '/' + 
                                apiUrl;
                        } else {
                            return this.endpoints[endpoint] + apiUrl;
                        }
                    }

                    
                } else {
                    // show notification
                    alert('Request error: Endpoint configuration wrong for ' + endpoint);
                }

            } else {
                // use first endpoint
                let endpointUrl = '';
                for (var key in this.endpoints) {
                    if(this.endpoints.hasOwnProperty(key)) {
                        endpointUrl = this.endpoints[key];
                        break;
                    }
                }
                return endpointUrl + url;

            }

        }
        return url;
    }
}

export function HttpServiceProvider(endpoints: any) {
    return {
      provide: Http, 
      useFactory: (backend: XHRBackend, defaultOptions: RequestOptions) => new HttpService(backend, defaultOptions, endpoints),
      deps: [XHRBackend, RequestOptions]
    }
}
