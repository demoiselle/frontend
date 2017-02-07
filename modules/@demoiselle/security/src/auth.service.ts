import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';

import { AuthHttp, JwtHelper } from 'angular2-jwt';

@Injectable()
export class AuthService {

  private token: string = null;
  private tokenInterval: any = null;
  private reTokenInterval: any = null;

  jwtHelper: JwtHelper = new JwtHelper();

  // Observable login source
  private loginChangeSource = new BehaviorSubject<string>('');
  // Observable login stream
  loginChange$ = this.loginChangeSource.asObservable();

  // Url for redirection after login
  public redirectUrl: string = '';

  constructor(private http: Http, private authHttp: AuthHttp, private router: Router, private config: any) {
    // config.authEndpointUrl = config.authEndpointUrl || '';
    config.loginResourcePath = config.loginResourcePath || 'auth/login';
    config.tokenKey = config.tokenKey || 'id_token';
    config.loginRoute = config.loginRoute || '/login';
    config.doReToken = config.doReToken || false;

    if (!config.tokenGetter) {
      config.tokenGetter = () => localStorage.getItem(config.tokenKey) as string;
    }
    if (!config.tokenSetter) {
      config.tokenSetter = (val: string) => localStorage.setItem(config.tokenKey, val)
    }
    if (!config.tokenRemover) {
      config.tokenRemover = () => localStorage.removeItem(config.tokenKey)
    }

    this.initializeToken();
  }

  initializeToken() {
    let jwtToken = this.config.tokenGetter(); 
    if (jwtToken instanceof Promise) {
      jwtToken.then((tokenFromPromise: string) => {
          this.token = tokenFromPromise;
          this.reToken();
      });
    } else {
      this.token = jwtToken;
      this.reToken();
    }
  }

  setToken(token: string) {
    this.config.tokenSetter(token);
    this.token = token;
  }

  removeToken() {
    this.config.tokenRemover();
    this.token = null;
  }

  public getToken() {
    return this.token;
  }

  public getLoginRoute() {
    return this.config.loginRoute;
  }

  isAuthenticated() {
    return (this.token !== null);
  }

  logout() {
    //localStorage.removeItem(this.config.tokenKey);
    this.removeToken();

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
        //localStorage.setItem(this.config.tokenKey, token);
        this.setToken(token);

        if (this.config.doReToken) {
          this.setReTokenInterval();
        } else {
          this.setTokenInterval();
        }
        this.loginChangeSource.next(token);
        this.router.navigate([ this.redirectUrl ]);
        
        return json;

      });

  }
  
  getDataFromToken() {
    let data: any = null;
    if (this.token !== null && typeof this.token !== undefined) {
      data = this.jwtHelper.decodeToken(this.token);
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

  /**
   * Performs the reToken process if active
   * Gets a new token from backend and schedule a new reToken 
   */
  reToken() {
    if (this.config.doReToken && this.isAuthenticated()) {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.set('Authorization', 'Token ' + this.token);

      this.http.get(this.config.authEndpointUrl + 'auth', { headers: headers })
        .map(res => res.json())
        .subscribe((res) => {
          let token = res.token;
          //localStorage.setItem(this.config.tokenKey, token);
          this.setToken(token);
          this.unsetReTokenInterval();
          this.setReTokenInterval();
        });
    }
  }

  /**
   * Activate the ReToken polling
   * Can be initiliazed/called from app.component.ts: ngAfterContentInit()
   * @deprecated Use AuthServiceProvider config instead
   */
  initializeReTokenPolling() {
    this.config.doReToken = true;
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
    if (this.token !== null) {
      //localStorage.removeItem(this.config.tokenKey);
      this.removeToken();
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
    useFactory: (http: Http, authHttp: AuthHttp, router: Router) => new AuthService(http, authHttp, router, config),
    deps: [Http, AuthHttp, Router]
  };
}
