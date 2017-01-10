import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AuthHttp, JwtHelper } from 'angular2-jwt';

@Injectable()
export class AuthService {

  private doReToken: Boolean = false;
  private tokenInterval: any = null;
  private reTokenInterval: any = null;

  jwtHelper: JwtHelper = new JwtHelper();

  // Observable login source
  private loginChangeSource = new BehaviorSubject<string>('');
  // Observable login stream
  loginChange$ = this.loginChangeSource.asObservable();

  constructor(private http: Http, private authHttp: AuthHttp, private config: any) {
    // config.authEndpointUrl = config.authEndpointUrl || '';
    config.loginResourcePath = config.loginResourcePath || 'auth/login';
    config.tokenKey = config.tokenKey || 'id_token';
    config.loginRoute = config.loginRoute || '/login';
  }

  public getLoginRoute() {
    return this.config.loginRoute;
  }

  isAuthenticated() {
    return (localStorage.getItem(this.config.tokenKey) !== null);
  }

  logout() {
    localStorage.removeItem(this.config.tokenKey);

    this.loginChangeSource.next('');
  }

  login(credentials: any) {
    let url = this.config.authEndpointUrl + this.config.loginResourcePath;
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    return this.http.post(url, JSON.stringify(credentials), { headers: headers })
      .map((res) => {
        // ** located in header response
        // let responseHeaders = res.headers;
        // let token = responseHeaders.get('Set-Token');
        // localStorage.setItem('id_token', token);

        // ** located in body response
        let json = res.json();
        let token = json.token;
        localStorage.setItem(this.config.tokenKey, token);

        if (this.doReToken) {
          this.setReTokenInterval();
        } else {
          this.setTokenInterval();
        }

        this.loginChangeSource.next(token);

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
    let hasAuthorizedRole = false;

    if (this.isAuthenticated()) {

      let roles = this.getRolesFromToken();

      if (roles !== undefined && roles !== null) {
        for (let i = 0; i < authorizedRoles.length; i++) {
          if (roles.indexOf(authorizedRoles[i]) !== -1) {
            hasAuthorizedRole = true;
            break;
          }

        }
      }
    }

    return hasAuthorizedRole;
  }

  reToken() {
    if (this.isAuthenticated()) {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.set('Authorization', 'Token ' + localStorage.getItem(this.config.tokenKey));

      this.http.get(this.config.authEndpointUrl + 'auth', { headers: headers })
        .map(res => res.json())
        .subscribe((res) => {
          let token = res.token;
          localStorage.setItem(this.config.tokenKey, token);
          this.unsetReTokenInterval();
          this.setReTokenInterval();
        });
    }
  }

  /**
   * Can be initiliazed/called from app.component.ts: ngAfterContentInit()
   */
  initializeReTokenPolling() {
    this.doReToken = true;
  }

  setTokenInterval() {
    let tokenData = this.getDataFromToken();
    if (tokenData) {
      let intervalInSeconds = tokenData.exp - tokenData.iat;
      let intervalInMiliseconds = intervalInSeconds * 1000;

      this.tokenInterval = Observable.interval(intervalInMiliseconds).subscribe(() => {
        this.unsetTokenInterval();
      });
    }
  }

  unsetTokenInterval() {
    if (this.tokenInterval) {
      this.tokenInterval.unsubscribe();
      this.tokenInterval = null;
    }
    if (localStorage && localStorage.getItem(this.config.tokenKey)) {
      localStorage.removeItem(this.config.tokenKey);
    }
  }

  setReTokenInterval() {
    let tokenData = this.getDataFromToken();
    if (tokenData) {
      let intervalInSeconds = tokenData.exp - tokenData.iat - 60; // one minute before expiration
      let intervalInMiliseconds = intervalInSeconds * 1000;

      this.reTokenInterval = Observable.interval(intervalInMiliseconds).subscribe(() => {
        this.reToken();
      });
    }
  }

  unsetReTokenInterval() {
    if (this.reTokenInterval) {
      this.reTokenInterval.unsubscribe();
      this.reTokenInterval = null;
    }
  }
}

export function AuthServiceProvider(config: any) {
  return {
    provide: AuthService,
    useFactory: (http: Http, authHttp: AuthHttp) => new AuthService(http, authHttp, config),
    deps: [Http, AuthHttp]
  };
}
