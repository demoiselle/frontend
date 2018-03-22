import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { TokenService, Token } from '../../security/dist/token.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  headerName: string;
  constructor(private tokenService: TokenService) {
    this.headerName = 'Authorization';
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Clone the request to add the new headers.
    let authReq = req;
    if (!(req.body instanceof FormData)) {
      authReq = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
    }

    // let token = localStorage.getItem('id_token');
    const token = this.tokenService.getToken();
    if (token != null) {
        // const authScheme = token.split(' ')[0];
        // const authKey = token.substring(authScheme.length + 1);
        const authScheme = token.type;
        const authKey = token.key;
        if (authKey && authScheme) {
            authReq = authReq.clone({ headers: authReq.headers.set(this.headerName, `${authScheme} ${authKey}`) });
        }
    }
    // Pass on the cloned request instead of the original request.
    return next.handle(authReq);

  }
}


