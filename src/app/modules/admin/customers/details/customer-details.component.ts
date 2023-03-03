import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormGroup,
    FormBuilder,
    UntypedFormGroup,
    UntypedFormArray,
    Validators,
} from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil } from 'rxjs';
import { CustomersService } from '../customers.service';
import { Customer } from '../customers.types';

@Component({
    selector: 'customer-details',
    templateUrl: './customer-details.component.html',
    styleUrls: ['./customer-details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetailsComponent implements OnInit, OnDestroy {
    formGroup: UntypedFormGroup;
    customer: Customer;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _customersService: CustomersService,
        private _fuseConfirmationService: FuseConfirmationService
    ) {}

    get license(): UntypedFormGroup {
        return this.formGroup.controls['license'] as UntypedFormGroup;
    }

    get devices(): [] {
        return this.license.controls['devices'].value as [];
    }

    ngOnInit(): void {
        this.formGroup = this._formBuilder.group({
            description: ['', [Validators.required]],
            license: this._formBuilder.group({
                maxDevices: [null],
                expireDate: [null],
                devices: [[]],
                code: [null],
            }),
            appConfigurations: this._formBuilder.group({
                apiKey: [null, [Validators.required]],
                apiAccount: [null, [Validators.required]],
                apiAccountPassword: [null, [Validators.required]],
                markerStopDurationInMinute: [null, [Validators.required]],
            }),
        });

        // Get the customer
        this._customersService.customer$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((customer: Customer) => {
                // Get the customer
                this.customer = customer;

                // Clear the emails and phoneNumbers form arrays

                // Patch values to the form
                this.formGroup.patchValue(customer);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    saveCustomer(): void {
        const customer = this.formGroup.getRawValue();
        if (this.customer?.code) {
            this._customersService
                .updateCustomer(this.customer.code, customer)
                .subscribe();
        } else {
            this._customersService.createCustomer(customer).subscribe();
        }
    }
    removeEmailField(device: string): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Elimina Device',
            message: 'Sei sicuro di voler eliminare questo dispositivo?',
            actions: {
                confirm: {
                    label: 'Elimina',
                },
            },
        });
        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._customersService
                    .removeDevice(device)
                    .subscribe((isDeleted) => {
                        console.log(isDeleted);
                    });
            }
        });
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
