import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, ConnectionBackend, RequestOptionsArgs, Response, XHRBackend } from '@angular/http';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { Request } from '@angular/http/src/static_request';
import { Router } from '@angular/router';
import { ExceptionService } from './exception.service';

@Injectable()
export class HttpService extends Http {

    /**
     * Constructor
     */
    constructor(
        _backend: ConnectionBackend,
        _defaultOptions: RequestOptions,
        private router: Router,
        private exceptionService: ExceptionService,
        private config: any)
    {
        super(_backend, _defaultOptions);

        config.endpoints = config.endpoints || {};
        config.multitenancy = config.multitenancy || { 'active': false };
        config.unAuthorizedRoute = config.unAuthorizedRoute || '/login';
        config.forbiddenRoute = config.forbiddenRoute || '/login';
        config.tokenKey = config.tokenKey || 'id_token';

        if (!config.tokenGetter) {
            config.tokenGetter = () => localStorage.getItem(config.tokenKey) as string;
        }

    }

    private requestWithToken(token: string, url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        
        if (token != null) {
            let tokenType = token.split(' ')[0];
            let tokenKey = token.substring(tokenType.length + 1);
            if (tokenType.length > 0 && tokenKey.length > 0) { 
                if (typeof url === 'string') { // meaning we have to add the token to the options, not in url
                    url = this.appendEndpoint(url);
                    if (!options) {
                        // let's make option object
                        options = { headers: new Headers() };
                    }
                    options.headers.set('Authorization', `${tokenType} ${tokenKey}`);
                } else {
                    // we have to add the token to the url object
                    url.headers.set('Authorization', `${tokenType} ${tokenKey}`);
                }
            }
        }
        
        return super.request(url, options);
    }

    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        let token = this.config.tokenGetter();
        if (token instanceof Promise) {
            return Observable.fromPromise(token).mergeMap((jwtToken: string) => this.requestWithToken(jwtToken, url, options));
        } else {
            return this.requestWithToken(token, url, options);
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

    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        url = this.appendEndpoint(url);
        return this.intercept(super.patch(url, body, options));

    }

    intercept(observable: Observable<Response>): Observable<Response> {
        return observable.catch((err, source) => {
            if (err.status === 401) {
                let typeOfUnauthorizedRoute = typeof this.config.unAuthorizedRoute;
                switch (typeOfUnauthorizedRoute) {
                    case 'function':
                        this.config.unAuthorizedRoute();
                        break;
                    default:
                        this.router.navigate([this.config.unAuthorizedRoute]);
                        break;
                }
                return Observable.throw(err);
            } else if (err.status === 403) {
                let typeOfForbiddenRoute = typeof this.config.forbiddenRoute;
                switch (typeOfForbiddenRoute) {
                    case 'function':
                        this.config.forbiddenRoute();
                        break;
                    default:
                        this.router.navigate([this.config.forbiddenRoute]);
                        break;
                }
                return Observable.throw(err);
            } else {
                this.exceptionService.handleError(err);
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
    private appendEndpoint(url: string): string {
        if (!(url.lastIndexOf('http', 0) === 0)) { // startsWith in ES5
            if (url.lastIndexOf('~', 0) === 0) { // startsWith in ES5
                let apiUrl = url.substring(url.indexOf('/') + 1);
                let endpoint = url.substring(1, url.indexOf('/'));
                if (this.config.endpoints.hasOwnProperty(endpoint)) {

                    if (this.config.multitenancy.active) {
                        if (localStorage.getItem('dml_tenant')) {
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
                for (let key in this.config.endpoints) {
                    if (this.config.endpoints.hasOwnProperty(key)) {
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
 * - unAuthorizedRoute: string value or callback for unauthorized redirection route
 * - forbiddenRoute: string value or callback for forbidden redirection route
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
 *  'forbiddenRoute' : '/login',
 *  'tokenKey' : 'id_token'
 * }
 *  
 */
export function HttpServiceProvider(config: any) {
    return {
        provide: Http,
        useFactory: (backend: XHRBackend, defaultOptions: RequestOptions, router: Router, exceptionService: ExceptionService) => new HttpService(backend, defaultOptions, router, exceptionService, config),
        deps: [XHRBackend, RequestOptions, Router, ExceptionService]
    };
}
