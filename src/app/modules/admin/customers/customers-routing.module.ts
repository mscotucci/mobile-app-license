import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersComponent } from './customers.component';
import { CustomerResolver, CustomersResolver } from './customers.resolver';
import { CustomerDetailsComponent } from './details/customer-details.component';
import { CustomerListComponent } from './list/customer-list.component';

const routes: Routes = [
    {
        path: '',
        component: CustomersComponent,
        resolve: {
            customers: CustomersResolver,
        },
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: CustomerListComponent,
            },
            {
                path: 'details/:id',
                component: CustomerDetailsComponent,
                resolve: {
                    customer: CustomerResolver,
                },
            },
            {
                path: 'details',
                component: CustomerDetailsComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CustomersRoutingModule {}
