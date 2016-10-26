import {Injectable} from '@angular/core';
import {Http, RequestOptions, ConnectionBackend, RequestOptionsArgs, Response} from '@angular/http';
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
     * Append endpoint url according to class attribute endpoints
     * Rules:
     * 
     * Url 'http://someurl'             => Url is not changed
     * Url '~endpoint1/api/resource'    => endpoint1's url concatenated with 'api/resource'
     * Url 'api/resource'               => Request is made to local server 
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
                    alert('Request error: Endpoint configuration wrong!');
                }

            } else {
                // get first endpoint
                let endpointUrl = '';
                for (var key in this.endpoints) {
                    console.log('key: ' + key + ' ---- value: ' + this.endpoints[key]);
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
