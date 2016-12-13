import { inject, TestBed } from '@angular/core/testing';

import { DmlHttpModule} from './http.module';
import { HttpService, HttpServiceProvider } from './http.service';
import {Http, RequestOptions, ConnectionBackend, RequestOptionsArgs, Response, XHRBackend} from '@angular/http';

describe('Http Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [DmlHttpModule],
        providers: [HttpServiceProvider({
            'endpoints': {
                'main' : 'http://localhost:9090'
            },
            'multitenancy': {
                'active' : false
            },
            'unAuthorizedRoute' : '/login',
            'tokenKey' : 'id_token'
        })]
    });
  });

  it('should http service ...', inject([], () => {
    expect('test').toBe('test');
  }));
});