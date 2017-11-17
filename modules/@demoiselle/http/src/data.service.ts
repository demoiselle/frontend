import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { ExceptionService } from './exception.service';

export class DataService {
    protected _this: DataService;
    constructor(
        private url: string,
        private resourceName: string,
        private http: HttpClient,
        private exceptionService: ExceptionService) { }

    findAll() {
        return this.http.get(this.url, {observe: 'response'})
            // .map(response => response.body)
            .catch(error => this.handleError(error));
    }

    find(id: string) {
        return this.http.get(`${this.url}/${id}`)
            // .map(response => response.data)
            .catch(error => this.handleError(error));
    }

    create(resource: any) {

        return this.http.post(this.url, JSON.stringify(resource))
            .catch(error => this.handleError(error));
    }

    update(resource: any) {
        // patch or put???
        return this.http.put(`${this.url}`, JSON.stringify(resource))
        .catch(error => this.handleError(error));
    }

    delete(id: string) {
        return this.http.delete(`${this.url}/${id}`)
        .catch(error => this.handleError(error));
    }

    private handleError(error: any) {
        this.exceptionService.handleError(error);
        return Observable.throw(error);
    }
}
