import { TestBed, inject } from '@angular/core/testing';

import { CaptchaService } from '../src/captcha';

describe('Captcha Test Suite', () => {
  
  // provide our implementations or mocks to the dependency injector
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [],
      providers: [CaptchaService]
    });
  });

  it('should some test', inject([ApiService], (api) => {
    expect('example').toBe('example');
  }));

});
