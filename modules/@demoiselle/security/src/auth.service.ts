import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import {Observable} from 'rxjs/Rx';

import { tokenNotExpired, JwtHelper, AuthHttp } from 'angular2-jwt';

@Injectable()
export class AuthService {

  jwtHelper: JwtHelper = new JwtHelper();

  constructor(private http: Http, private authHttp: AuthHttp) {
  }


  isAuthenticated() {
    return tokenNotExpired('id_token');
    //return localStorage.getItem('currentUser');
  }

  logout() {
    localStorage.removeItem('id_token');
    //localStorage.removeItem('currentUser');
  }

  login(credentials: any) {
    let _this = this;
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http.post('http://supsd.cta.serpro/livraria/api/auth',
    //return this.http.post('api/auth',
      JSON.stringify(credentials),
      { headers: headers })
      //.map(res => res.json())
      .map((res) => {
        var responseHeaders = res.headers;
        var token = responseHeaders.get('Set-Token');
        localStorage.setItem('id_token', token);

         //_this.http.get('http://supsd.cta.serpro/livraria/api/book')
         _this.http.get('~produto/api/book')
             .map(res => res.json())
             .subscribe((res) => {
                 console.log(res)
             });

      });


  }

  /**
   * getUserFromToken demoiselle 2.5 backend
   */
  getUserFromToken() {
    let data = this.getDataFromToken();
    return JSON.parse(data.user);
  }


  /* demoiselle 3 backend jwttoken
  {
    "iss": "STORE",
    "aud": "web",
    "exp": 1476756643,
    "jti": "fQmYw8mvGUraZMzQZ3-bgQ",
    "iat": 1476713443,
    "nbf": 1476713383,
    "identity": "1",
    "name": "Demoiselle",
    "roles": [
      "ADMINISTRATOR"
    ],
    "permissions": {}
  }
    
  */

  getDataFromToken() {
    let token = localStorage.getItem('id_token');
    var data = null;
    if (token !== null && typeof token !== undefined) {
      data = this.jwtHelper.decodeToken(token);
    }
    return data;
  }


  isAuthorized(authorizedRoles: string[]) {

    if (this.isAuthenticated()) {

      var hasAuthorizedRole = false;

      var perfil = null; //this.$rootScope.currentUser.perfil;
      //alert(localStorage.getItem('token'));

      if (perfil !== undefined && perfil !== null) {
        for (let i = 0; i < authorizedRoles.length; i++) {
          if (authorizedRoles[i] === perfil) {
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

      return this.http.get('http://supsd.cta.serpro/livraria/api/auth',
        { headers: headers })
        .map(res => res.json())
        .subscribe((res) => {
          var token = res.token;
          localStorage.setItem('id_token', token);

        });
    }
  }

/**
 * Can be initiliazed/called from app.component.ts: ngAfterContentInit()
 */
  initializeReTokenPolling(interval: number) {
    
    return Observable
      .interval(interval)
      .subscribe(() => {
        return this.reToken();
        
      });
  }


}
