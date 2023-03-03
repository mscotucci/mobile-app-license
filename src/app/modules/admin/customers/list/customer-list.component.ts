import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { CustomersService } from '../customers.service';

@Component({
    selector: 'customer-list',
    templateUrl: './customer-list.component.html',
    styleUrls: ['./customer-list.component.scss'],
})
export class CustomerListComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('recentTransactionsTable', { read: MatSort })
    customersTableMatSort: MatSort;

    customersTableColumns: string[] = [
        'description',
        'maxDevices',
        'expireDate',
        'actions',
    ];

    customersDataSource: MatTableDataSource<any> = new MatTableDataSource();
    searchInputControl: FormControl = new FormControl();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private customerService: CustomersService) {}

    ngOnInit(): void {
        // Get the data
        this.customerService
            .getCustomers()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                // Store the table data
                this.customersDataSource.data = data;
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Make the data source sortable
        this.customersDataSource.sort = this.customersTableMatSort;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.code || index;
    }
}
