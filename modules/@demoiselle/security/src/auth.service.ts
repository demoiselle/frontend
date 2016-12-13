import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import {Observable} from 'rxjs/Rx';

import { AuthHttp, tokenNotExpired, JwtHelper } from 'angular2-jwt';

@Injectable()
export class AuthService {

  jwtHelper: JwtHelper = new JwtHelper();

  constructor(private http: Http, private authHttp: AuthHttp, private config: any) {
    //config.authEndpointUrl = config.authEndpointUrl || '';
    config.loginResourcePath = config.loginResourcePath || 'auth/login';
    config.tokenKey = config.tokenKey || 'id_token';
    config.loginRoute = config.loginRoute || '/login';  
  }

  public getLoginRoute() {
    return this.config.loginRoute;
  }

  isAuthenticated() {
    //return tokenNotExpired(this.config.tokenKey);
    return (localStorage.getItem(this.config.tokenKey) != null);
  }

  logout() {
    localStorage.removeItem(this.config.tokenKey);
  }

  login(credentials: any) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http.post(this.config.authEndpointUrl + this.config.loginResourcePath,
      JSON.stringify(credentials),
      { headers: headers })
      .map((res) => {
        // ** located in header response
        // var responseHeaders = res.headers;
        // var token = responseHeaders.get('Set-Token');
        // localStorage.setItem('id_token', token);

        // ** located in body response
        let json = res.json();
        let token = json.token;
        localStorage.setItem(this.config.tokenKey, token);
        return json;

      });


  }

  /**
   * getUserFromToken demoiselle 2.5 backend
   */
  // getUserFromToken25() {
  //   let data = this.getDataFromToken();
  //   return JSON.parse(data.user);
  // }


  /* demoiselle 3 backend jwttoken
  {
  "iss": "APP",
  "aud": "web",
  "exp": 1478863521,
  "jti": "2384598374593874",
  "iat": 1478863221,
  "nbf": 1478863161,
  "identity": "1",
  "name": "Demoiselle",
  "roles": [
    "ADMINISTRATOR"
  ],
  "permissions": {
    "SWAGGER": [
      "LIST"
    ]
  },
  "params": {
    "Fone": [
      null
    ],
    "Email": [
      "admin@demoiselle.org"
    ]
  }
}
  */
  getDataFromToken() {
    let token = localStorage.getItem(this.config.tokenKey);
    let data: any = null;
    if (token !== null && typeof token !== undefined) {
      data = this.jwtHelper.decodeToken(token);
    }
    return data;
  }

  getRolesFromToken() {
    return this.getDataFromToken().roles;
  }
  getPermissionsFromToken() {
    return this.getDataFromToken().permissions;
  }
  getParamsFromToken() {
    return this.getDataFromToken().params;
  }
  getIdentityFromToken() {
    return this.getDataFromToken().identity;
  }
  getNameFromToken() {
    return this.getDataFromToken().name;
  }

  isAuthorized(authorizedRoles: string[]) {

    if (this.isAuthenticated()) {

      var hasAuthorizedRole = false;

      var roles = this.getRolesFromToken();

      if (roles !== undefined && roles !== null) {
        for (let i = 0; i < authorizedRoles.length; i++) {
          if (roles.indexOf(authorizedRoles[i]) !== -1) {
            hasAuthorizedRole = true;
            break;
          }

        }
      }
    } else {
      return false;
    }

    return hasAuthorizedRole;
  }

  reToken() {
    if(this.isAuthenticated()) {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');

      this.authHttp.get(this.config.authEndpointUrl + 'auth',
        { headers: headers })
        .map(res => res.json())
        .subscribe((res) => {
          var token = res.token;
          localStorage.setItem(this.config.tokenKey, token);

        });
    }
  }

/**
 * Can be initiliazed/called from app.component.ts: ngAfterContentInit()
 */
  initializeReTokenPolling(interval: number) {
    
    Observable
      .interval(interval)
      .subscribe(() => {
        this.reToken();
        
      });
  }


}

export function AuthServiceProvider(config: any){
  return {
    provide: AuthService,
    useFactory: (http: Http, authHttp: AuthHttp) => new AuthService(http, authHttp, config),
    deps: [Http, AuthHttp]
  }
}
