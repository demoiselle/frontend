import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class ExceptionService {
    /**
     * Observable server validation source
     */
    private validationSource = new BehaviorSubject<any>({});

    /**
     * Observable server validation stream
     */
    validation$ = this.validationSource.asObservable();

    /**
     * Observable source for general errors
     */
    private generalErrorsSource = new BehaviorSubject<any>({});

    /**
     * Observable stream for general errors (400, 500 ...)
     */
    generalErrors$ = this.generalErrorsSource.asObservable();


    public handleError(error: any) {
        let errorsBody = error._body || '[]';
        let errors = JSON.parse(errorsBody);

        if (error.status === 412) { // validation error
          for (let err of errors) {
            let parts = err.error.split('.');
            err.error_method = parts[0] || null;
            err.error_entity = parts[1] || null;
            err.error_field  = parts[2] || null;
          }
          
          this.validationSource.next(errors);
        
    
        } else { // other errors
            this.generalErrorsSource.next(errors);
        }
    }


}