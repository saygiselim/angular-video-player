import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {
    sessionID: string;

    constructor() {
        this.sessionID = this.generateUUIDV4();
        // Session created
        console.log('Session ID: ' + this.sessionID);
    }

    /**
     * Generates UUID v4
     *
     * for more information : https://www.ietf.org/rfc/rfc4122.txt
     */
    private generateUUIDV4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            // tslint:disable-next-line: no-bitwise
            const r = Math.random() * 16 | 0;
            // tslint:disable-next-line: no-bitwise
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
