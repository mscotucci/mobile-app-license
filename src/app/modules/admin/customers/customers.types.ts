export interface License {
    code: string;
    maxDevices: number;
    expireDate?: any;
    devices?: any[];
}

export interface Customer {
    code: string;
    description?: string;
    license?: License;
    appConfigurations?: AppConfigurations;
}

export interface UpdateCustomer {
    description?: string;
    maxDevices: number;
    expireDate?: any;
    appConfigurations?: AppConfigurations;
}

export interface AppConfigurations {
    apiKey: string;
    apiAccount: string;
    apiAccountPassword: string;
    markerStopDurationInMinute: number;
}
