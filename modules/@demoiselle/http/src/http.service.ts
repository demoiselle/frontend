import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, ConnectionBackend, RequestOptionsArgs, Response, XHRBackend } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Request } from '@angular/http/src/static_request';
import { Router } from '@angular/router';
//import { tokenNotExpired, JwtHelper, AuthHttp } from 'angular2-jwt';

@Injectable()
export class HttpService extends Http {
    
    /**
     * Constructor
     * 
     */
    constructor(_backend: ConnectionBackend, _defaultOptions: RequestOptions, private router: Router, private config: any) {
        super(_backend, _defaultOptions);

        config.endpoints = config.endpoints || {};
        config.multitenancy = config.multitenancy || {'active' : false};
        config.unAuthorizedRoute = config.unAuthorizedRoute || '/login';
        config.tokenKey = config.tokenKey || 'id_token';

        let jwtHeader = localStorage.getItem(config.tokenKey);
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
                this.router.navigate([this.config.unAuthorizedRoute]);
                return Observable.empty();
            } else if (err.status  == 412 || err.status == 422) {
                // TODO: Tratamento da validação ??? 
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
                if (this.config.endpoints.hasOwnProperty(endpoint)) {
                    
                    if(this.config.multitenancy.active) {
                        if(localStorage.getItem('dml_tenant')) {
                            return this.config.endpoints[endpoint] + 
                                JSON.parse(localStorage.getItem('dml_tenant')).name + '/' + 
                                apiUrl;
                        } else {
                            return this.config.endpoints[endpoint] + apiUrl;
                        }
                    } else {
                        return this.config.endpoints[endpoint] + apiUrl;
                    }

                    
                } else {
                    // show notification
                    alert('Request error: Endpoint configuration wrong for ' + endpoint);
                }

            } else {
                // use first endpoint
                let endpointUrl = '';
                for (var key in this.config.endpoints) {
                    if(this.config.endpoints.hasOwnProperty(key)) {
                        endpointUrl = this.config.endpoints[key];
                        break;
                    }
                }
                return endpointUrl + url;

            }

        }
        return url;
    }
}

/**
 * HttpService provider function.
 * 
 * @param config
 * Config attributes:
 * - endpoints: object with a list of endpoints available for the app
 * - multitenancy: multitenancy configuration
 * - unAuthorizedRoute: string value for unauthorized redirection route
 * Example:
 * {
 *  'endpoints' : { 
 *      'main': 'http://localhost:9090/app/api/v1',
 *      'main2': 'http://localhost:9090/app2/api/v1'
 *  },
 *  'multitenancy': {
 *      'active': false,
 *      'apiUrl': 'http://localhost:9090/users/api/v1/'
 *  },
 *  'unAuthorizedRoute' : '/login',
 *  'tokenKey' : 'id_token'
 * }
 *  
 */
export function HttpServiceProvider(config: any) {
    return {
      provide: Http, 
      useFactory: (backend: XHRBackend, defaultOptions: RequestOptions, router: Router) => new HttpService(backend, defaultOptions, router, config),
      deps: [XHRBackend, RequestOptions, Router]
    }
}
