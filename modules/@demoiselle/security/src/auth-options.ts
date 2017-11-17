import {Injectable} from '@angular/core';

@Injectable()
export class AuthOptions {
    authEndpointUrl = '';
    loginResourcePath = 'auth';
    loginRoute: any = '/login';
    doReToken = false;

    tokenKey = 'id_token';
    tokenGetter = () => localStorage.getItem(this.tokenKey) as string;
    tokenSetter = (val: string) => localStorage.setItem(this.tokenKey, val);
    tokenRemover = () => localStorage.removeItem(this.tokenKey);

    constructor() {}
}
