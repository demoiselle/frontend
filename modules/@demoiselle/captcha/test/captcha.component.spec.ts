import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CaptchaComponent } from '../src/captcha.component';

describe('CaptchaComponent', () => {

  let component: CaptchaComponent;
  let fixture: ComponentFixture<CaptchaComponent>;
  let debugElement: DebugElement;
  let el: HTMLElement;

  // provide our implementations or mocks to the dependency injector
  // async beforeEach
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CaptchaComponent], // declare the test component
    })
      .compileComponents(); // compile template and css

  }));

  // sync beforeEach
  beforeEach(() => {
    fixture = TestBed.createComponent(CaptchaComponent);
    component = fixture.componentInstance;

    // query for the title <h1> by CSS element selector
    debugElement = fixture.debugElement.query(By.css('.dml-captcha--container'));
    el = debugElement.nativeElement;
  });

  it('should have a image', () => {
    fixture.detectChanges();

    let img = el.querySelector('img');
    expect(img).not.toBe(null);
  });

  // it('should have a token', () => { });
  // it('should load a audio when click on "playButton"', () => { });
  // it('should reload (image and token) when click on "refreshButton"', () => { });

});
