import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

/**
 * @class ExceptionService
 *
 * A simple service to provide Observables to data service errors
 * To subscribe and handle error events in you app:
 *
 * errorsSubscription: Subscription;
 * constructor(private exceptionService: ExceptionService, ...) {
 *   this.errorsSubscription = this.exceptionService.errors$.subscribe(
 *      error => this.handleError(error)
 *   );
 * }
 *
 */
@Injectable()
export class ExceptionService {
    /**
     * Observable source for errors
     */
    private errorsSource = new BehaviorSubject<any>(null);

    /**
     * Errors Observable stream
     */
    errors$ = this.errorsSource.asObservable();


    public handleError(error: any) {
        this.errorsSource.next(error);
    }


}
