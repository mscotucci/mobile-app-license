import { Injectable } from '@angular/core';
import {
    Resolve,
    Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
} from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { CustomersService } from './customers.service';
import { Customer } from './customers.types';

@Injectable({
    providedIn: 'root',
})
export class CustomerResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(
        private _customersService: CustomersService,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Customer> {
        return this._customersService
            .getCustomerByCode(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested contact is not available
                catchError((error) => {
                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url
                        .split('/')
                        .slice(0, -2)
                        .join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(() => new Error(error));
                })
            );
    }
}

@Injectable({
    providedIn: 'root',
})
export class CustomersResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _customersService: CustomersService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Customer[]> {
        return this._customersService.getCustomers();
    }
}
