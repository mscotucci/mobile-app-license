import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
    imports: [MatSnackBarModule],
})
export class ErrorsModule {
    /**
     * Constructor
     */
    constructor(@Optional() @SkipSelf() parentModule?: ErrorsModule) {
        // Do not allow multiple injections
        if (parentModule) {
            throw new Error(
                'ErrorsModule has already been loaded. Import this module in the AppModule only.'
            );
        }
    }
}
