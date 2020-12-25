import { Injectable } from '@angular/core';
@Injectable()
export class StorageService {
    /**
     * You can store a value in the storage with this function.
     * @param key unique identifier for the data will be stored
     * @param value value to be stored in the storage
     */
    putValue(key: string, value: string): void {
        window.localStorage.setItem(key, value);
    }

    /**
     * You can get stored value with the key identifier.
     * @param key unique identifier for the stored data
     * @param defaultValue if no data found, this value will be returned
     */
    getValue(key: string, defaultValue?: string): string | null {
        return window.localStorage.getItem(key) || defaultValue || null;
    }

    /**
     * You can store an object in the storage with this function.
     * @param key unique identifier for the stored object
     * @param object object to be stored in the storage
     */
    putObject(key: string, object: any): void {
        if (typeof object === 'object') {
            // Object must be converted to string before store.
            const value = JSON.stringify(object);
            this.putValue(key, value);
        } else {
            throw new Error('Value must be an object!');
        }
    }

    /**
     * You can get stored object with the key identifier.
     * @param key unique identifier for the stored object
     * @param defaultValue if no data found, this object will be returned
     */
    getObject(key: string, defaultObject?: any): any {
        const value = this.getValue(key);
        return value ? JSON.parse(value) : (defaultObject || null);
    }
}
