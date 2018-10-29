import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService, Token } from './token.service';
import { AuthOptions } from './auth-options';

@Injectable()
export class AuthService {
  private tokenInterval: any = null;
  private reTokenInterval: any = null;

  // Observable login source
  private loginChangeSource = new BehaviorSubject<string>('');
  // Observable login stream
  loginChange$ = this.loginChangeSource.asObservable();

  // Url for redirection after login
  public redirectUrl = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    private options: AuthOptions
  ) {
    // config.loginResourcePath = config.loginResourcePath || 'auth/login';
    // config.loginRoute = config.loginRoute || '/login';
    // config.doReToken = config.doReToken || false;

    if (this.options.doReToken) {
      this.reToken();
    } else {
      this.setTokenInterval();
    }
  }

  public getLoginRoute() {
    return this.options.loginRoute;
  }

  /**
   * @deprecated use TokenService.isAuthenticated() instead
   */
  isAuthenticated() {
    return this.tokenService.isAuthenticated();
  }

  /**
   * @deprecated use TokenService.isAuthorized() instead
   */
  isAuthorized(authorizedRoles: string[]) {
    return this.tokenService.isAuthorized(authorizedRoles);
  }

  login(credentials: any) {
    let url = this.options.authEndpointUrl + this.options.loginResourcePath;
    // TODO: verify the need of add headers (or interceptor already add it)
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http
      .post(url, JSON.stringify(credentials), { headers: headers }).pipe(
        map(res => {
          let token = res as Token;

          this.tokenService.setToken(token);

          if (this.options.doReToken) {
            this.setReTokenInterval();
          } else {
            this.setTokenInterval();
          }
          this.loginChangeSource.next(token.key);
          this.router.navigate([this.redirectUrl]);

          return res;
        })
      );
  }

  social(social: any) {
    let url =
      this.options.authEndpointUrl + this.options.loginResourcePath + '/social';
    // TODO: verify the need of add headers (or interceptor already add it)
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http
      .post(url, JSON.stringify(social), { headers: headers }).pipe(
        map(res => {
          let token = res as Token;

          this.tokenService.setToken(token);

          if (this.options.doReToken) {
            this.setReTokenInterval();
          } else {
            this.setTokenInterval();
          }
          this.loginChangeSource.next(token.key);
          this.router.navigate([this.redirectUrl]);

          return res;
        })
      );
  }

  logout() {
    this.tokenService.removeToken();

    this.loginChangeSource.next('');
  }

  amnesia(credentials: any) {
    let url =
      this.options.authEndpointUrl +
      this.options.loginResourcePath +
      '/amnesia';
    // TODO: verify the need of add headers (or interceptor already add it)
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http
      .post(url, JSON.stringify(credentials), { headers: headers }).pipe(
        map(res => {})
      );
  }

  register(credentials: any) {
    let url =
      this.options.authEndpointUrl +
      this.options.loginResourcePath +
      '/register';
    // TODO: verify the need of add headers (or interceptor already add it)
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http
      .post(url, JSON.stringify(credentials), { headers: headers }).pipe(
        map(res => {})
      );
  }

  /**
   * Performs the reToken process if active
   * Gets a new token from backend and schedule a new reToken
   */
  reToken() {
    if (this.options.doReToken && this.tokenService.isAuthenticated()) {
      // TODO: verify the need of add headers (or interceptor already add it)
      // let headers = new HttpHeaders();
      // headers.append('Content-Type', 'application/json');
      // headers.set('Authorization', this.token.type + ' ' + this.token.key);

      this.http
        .get(this.options.authEndpointUrl + 'auth' /*, { headers: headers }*/)
        .subscribe(res => {
          let token = res as Token;

          this.tokenService.setToken(token);
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
    this.options.doReToken = true;
  }

  setTokenInterval() {
    let tokenData = this.tokenService.getDataFromToken();
    if (tokenData) {
      let intervalInSeconds = tokenData.exp - new Date().getTime() / 1000;
      let intervalInMiliseconds = intervalInSeconds * 1000;
      if (intervalInMiliseconds < 0) {
        this.unsetTokenInterval();
      } else {
        this.tokenInterval = interval(
          intervalInMiliseconds
        ).subscribe(() => {
          this.unsetTokenInterval();
        });
      }
    }
  }

  unsetTokenInterval() {
    if (this.tokenInterval) {
      this.tokenInterval.unsubscribe();
      this.tokenInterval = null;
    }
    this.tokenService.removeToken();
    // notifica os ouvintes de que o token expirou
    this.loginChangeSource.next('');
  }

  setReTokenInterval() {
    let tokenData = this.tokenService.getDataFromToken();
    if (tokenData) {
      let intervalInSeconds = tokenData.exp - new Date().getTime() / 1000 - 60; // one minute before expiration
      let intervalInMiliseconds = intervalInSeconds * 1000;
      if (intervalInMiliseconds < 0) {
        this.reToken();
      } else {
        this.reTokenInterval = interval(
          intervalInMiliseconds
        ).subscribe(() => {
          this.reToken();
        });
      }
    }
  }

  unsetReTokenInterval() {
    if (this.reTokenInterval) {
      this.reTokenInterval.unsubscribe();
      this.reTokenInterval = null;
    }
  }
}
