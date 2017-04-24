import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';

import { AuthHttp, JwtHelper } from 'angular2-jwt';

@Injectable()
export class AuthService {

  /**
   * Token structure
   * {
   *    type: 'string',
   *    key: 'string'
   * }
   */
  private token: any = null;
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
    let tokenString = this.config.tokenGetter(); 
    if (tokenString instanceof Promise) {
      tokenString.then((tokenFromPromise: string) => {
         this.token = this.tokenFromString(tokenFromPromise);
          if ( this.config.doReToken )
          this.reToken();
        else
          this.setTokenInterval();
      });
    } else {
      this.token = this.tokenFromString(tokenString);
      if ( this.config.doReToken )
        this.reToken();
      else
        this.setTokenInterval();
    }
  }

  private tokenFromString(tokenString: string) {

    if (tokenString !== null && tokenString !== undefined) {
      let type = tokenString.split(' ')[0];
      let key = tokenString.substring(type.length + 1);
      return {
          type: type,
          key: key
      };
    } else {
      return null;
    }

  }

  /**
   * Set token in storage in the form "TokenType TokenKey" ex: "JWT tokencontentkey"
   * Also keeps it in memory -> this.token 
   */
  setToken(token: any) {
    let tokenString = token.type + ' ' + token.key;
    this.config.tokenSetter(tokenString);
    this.token = token;
  }

  removeToken() {
    this.config.tokenRemover();
    this.token = null;
  }

  public getToken() {
    return this.token.key;
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
        let token = {
          type: json.type,
          key: json.key
        };
        
        //localStorage.setItem(this.config.tokenKey, token);
        this.setToken(token);

        if (this.config.doReToken) {
          this.setReTokenInterval();
        } else {
          this.setTokenInterval();
        }
        this.loginChangeSource.next(token.key);
        this.router.navigate([ this.redirectUrl ]);
        
        return json;

      });

  }
  
  getDataFromToken() {
    let data: any = null;
    if (this.token !== null && typeof this.token !== undefined) {
      data = this.jwtHelper.decodeToken(this.token.key);
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
      headers.set('Authorization', this.token.type + ' ' + this.token.key);

      this.http.get(this.config.authEndpointUrl + 'auth', { headers: headers })
        .map(res => res.json())
        .subscribe((res) => {
          
          let token = {
            type: res.type,
            key: res.key
          };

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
      let intervalInSeconds = tokenData.exp - ( new Date() ).getTime() / 1000;
      let intervalInMiliseconds = intervalInSeconds * 1000;
      if ( intervalInMiliseconds < 0 )
        this.unsetTokenInterval();
      else
        this.tokenInterval = Observable.interval( intervalInMiliseconds ).subscribe(() => {
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
    // notifica os ouvintes de que o token expirou
    this.loginChangeSource.next( '' );
  }

  setReTokenInterval() {
    let tokenData = this.getDataFromToken();
    if (tokenData) {
      let intervalInSeconds = tokenData.exp - ( new Date() ).getTime() / 1000 - 60; // one minute before expiration
      let intervalInMiliseconds = intervalInSeconds * 1000;
      if ( intervalInMiliseconds < 0 )
        this.reToken();
      else
        this.reTokenInterval = Observable.interval( intervalInMiliseconds ).subscribe(() => {
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
