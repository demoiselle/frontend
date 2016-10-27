import {Injectable} from '@angular/core';
import {Http, RequestOptions, ConnectionBackend, RequestOptionsArgs, Response, XHRBackend} from '@angular/http';
import {Observable} from 'rxjs/Rx';
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
        return super.post(url, body, options);
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        url = this.appendEndpoint(url);
        return super.get(url, options);
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
                    return this.endpoints[endpoint] + apiUrl;
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
