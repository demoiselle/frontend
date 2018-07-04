import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ExceptionService } from './exception.service';

export class DataService {
    protected _this: DataService;
    constructor(
        protected url: string,
        protected resourceName: string,
        protected http: HttpClient,
        protected exceptionService: ExceptionService) { }

    findAll(currentPage: number = null, itemsPerPage: number = null, filter = '', field: string = null, desc = false): any {
        let pagination = '';
        if (currentPage !== null && itemsPerPage !== null) {
            const start = (currentPage * itemsPerPage) - (itemsPerPage);
            const end = (currentPage * itemsPerPage) - 1;
            pagination = 'range=' + start + '-' + end;
        }
        let orderQuery = '';
        if (field) {
          orderQuery = '&sort=' + field + (desc ? '&desc' : '');
        }

        let queryString = pagination + filter + orderQuery;
        if (queryString !== '') {
            queryString = '?' + queryString;
        }

        return this.http.get(this.url + queryString, {observe: 'response'})
            .pipe(
                catchError(error => this.handleError(error))
            );
    }


    find(id: string): any {
        return this.http.get(`${this.url}/${id}`)
            .pipe(
                catchError(error => this.handleError(error))
            );
    }

    create(resource: any): any {

        return this.http.post(this.url, JSON.stringify(resource))
            .pipe(
                catchError(error => this.handleError(error))
            );
    }

    update(resource: any): any {
        return this.http.put(`${this.url}`, JSON.stringify(resource))
            .pipe(
                catchError(error => this.handleError(error))
            );
    }

    delete(id: string): any {
        return this.http.delete(`${this.url}/${id}`)
            .pipe(
                catchError(error => this.handleError(error))
            );
    }

    private handleError(error: any) {
        this.exceptionService.handleError(error);
        return throwError(error);
    }
}
