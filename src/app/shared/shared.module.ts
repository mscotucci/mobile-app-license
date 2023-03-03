import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageBodyComponent } from './layout/page-body/page-body.component';
import { PageHeaderComponent } from './layout/page-header/page-header.component';

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PageBodyComponent,
        PageHeaderComponent,
    ],
    declarations: [PageBodyComponent, PageHeaderComponent],
})
export class SharedModule {}
