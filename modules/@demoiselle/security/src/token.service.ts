import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthOptions } from './auth-options';

export interface Token {
  type: string;
  key: string;
}

@Injectable()
export class TokenService {
  private token: Token = null;
  jwtHelper = new JwtHelperService();

  constructor(private options: AuthOptions) {
    // options.tokenKey = options.tokenKey || 'id_token';
    // if (!options.tokenGetter) {
    //   options.tokenGetter = () =>
    //     localStorage.getItem(options.tokenKey) as string;
    // }
    // if (!options.tokenSetter) {
    //   options.tokenSetter = (val: string) =>
    //     localStorage.setItem(options.tokenKey, val);
    // }
    // if (!options.tokenRemover) {
    //   options.tokenRemover = () => localStorage.removeItem(options.tokenKey);
    // }

    this.initializeToken();
  }

  initializeToken() {
    let tokenString: any = this.options.tokenGetter();
    if (tokenString instanceof Promise) {
      tokenString.then((tokenFromPromise: string) => {
        this.token = this.tokenFromString(tokenFromPromise);
      });
    } else {
      this.token = this.tokenFromString(tokenString);
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
    this.options.tokenSetter(tokenString);
    this.token = token;
  }

  removeToken() {
    this.options.tokenRemover();
    this.token = null;
  }

  getToken() {
      return this.token;
  }

  public getTokenKey() {
    if (this.token) {
      return this.token.key;
    } else {
      return null;
    }
  }
  public getTokenType() {
    if (this.token) {
      return this.token.type;
    } else {
      return null;
    }
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

  isAuthenticated() {
    return (this.token !== null);
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
}
