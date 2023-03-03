import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import {
    BehaviorSubject,
    catchError,
    filter,
    map,
    Observable,
    of,
    switchMap,
    take,
    tap,
    throwError,
} from 'rxjs';
import { Customer } from './customers.types';

@Injectable({
    providedIn: 'root',
})
export class CustomersService {
    private _customer: BehaviorSubject<Customer | null> = new BehaviorSubject(
        null
    );
    private _customers: BehaviorSubject<Customer[] | null> =
        new BehaviorSubject([]);

    constructor(private _httpClient: HttpClient) {}

    /**
     * Getter for customer
     */
    get customer$(): Observable<Customer> {
        return this._customer.asObservable();
    }

    /**
     * Getter for customers
     */
    get customers$(): Observable<Customer[]> {
        return this._customers.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get customers
     */
    getCustomers(): Observable<Customer[]> {
        return this._httpClient
            .get<Customer[]>(`${environment.baseApiUrl}/customers`)
            .pipe(
                tap((customers) => {
                    this._customers.next(customers);
                })
            );
    }

    /**
     * Search customers with given query
     *
     * @param query
     */
    searchCustomers(query: string): Observable<Customer[]> {
        return this._httpClient
            .get<Customer[]>(`${environment.baseApiUrl}/customers/search`, {
                params: { query },
            })
            .pipe(
                tap((customers) => {
                    this._customers.next(customers);
                })
            );
    }

    /**
     * Get customer by code
     */
    getCustomerByCode(code: string): Observable<Customer> {
        return this._customers.pipe(
            take(1),
            map((customers) => {
                // Find the customer
                const customer =
                    customers.find((item) => item.code === code) || null;

                // Update the customer
                this._customer.next(customer);

                // Return the customer
                return customer;
            }),
            switchMap((customer) => {
                if (!customer) {
                    return throwError(
                        () =>
                            new Error(
                                'Could not found customer with code of ' +
                                    code +
                                    '!'
                            )
                    );
                }

                return of(customer);
            })
        );
    }

    /**
     * Create customer
     */
    createCustomer(customer): Observable<Customer> {
        return this.customers$.pipe(
            take(1),
            switchMap((customers) =>
                this._httpClient
                    .post<Customer>(
                        `${environment.baseApiUrl}/customers`,
                        customer
                    )
                    .pipe(
                        map((newCustomer) => {
                            // Update the customers with the new customer
                            this._customers.next([newCustomer, ...customers]);

                            // Return the new customer
                            return newCustomer;
                        })
                    )
            )
        );
    }

    /**
     * Update customer
     *
     * @param code
     * @param customer
     */
    updateCustomer(code: string, customer: Customer): Observable<Customer> {
        return this.customers$.pipe(
            take(1),
            switchMap((customers) =>
                this._httpClient
                    .put<Customer>(
                        `${environment.baseApiUrl}/customers/${code}`,
                        {
                            description: customer.description,
                            maxDevices: customer.license.maxDevices,
                            expireDate: customer.license.expireDate,
                            appConfigurations: customer.appConfigurations,
                        }
                    )
                    .pipe(
                        map(() => {
                            // Find the index of the updated customer
                            const index = customers.findIndex(
                                (item) => item.code === code
                            );

                            // Update the customer
                            customer.code = code;
                            customers[index] = {
                                ...customers[index],
                                ...customer,
                            };

                            // Update the customers
                            this._customers.next(customers);

                            // Return the updated customer
                            return customer;
                        }),
                        switchMap((updatedCustomer) =>
                            this.customer$.pipe(
                                take(1),
                                filter((item) => item && item.code === code),
                                tap(() => {
                                    // Update the customer if it's selected
                                    this._customer.next(updatedCustomer);

                                    // Return the updated customer
                                    return updatedCustomer;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the customer
     *
     * @param code
     */
    deleteCustomer(code: string): Observable<boolean> {
        return this.customers$.pipe(
            take(1),
            switchMap((customers) =>
                this._httpClient
                    .delete('api/apps/customers/customer', { params: { code } })
                    .pipe(
                        map((isDeleted: boolean) => {
                            // Find the index of the deleted customer
                            const index = customers.findIndex(
                                (item) => item.code === code
                            );

                            // Delete the customer
                            customers.splice(index, 1);

                            // Update the customers
                            this._customers.next(customers);

                            // Return the deleted status
                            return isDeleted;
                        })
                    )
            )
        );
    }

    removeDevice(uuid: string): Observable<boolean> {
        return this.customer$.pipe(
            take(1),
            switchMap((customer) =>
                this._httpClient
                    .delete(
                        `${environment.baseApiUrl}/customers/${customer.code}/delete-device/${uuid}`
                    )
                    .pipe(
                        map(() => {
                            // Find the index of the deleted customer
                            const index = customer.license.devices.findIndex(
                                (item) => item === uuid
                            );
                            customer.license.devices.splice(index, 1);
                            // Update the customers
                            this._customer.next(customer);

                            // Return the deleted status
                            return true;
                        })
                    )
            )
        );
    }
}
