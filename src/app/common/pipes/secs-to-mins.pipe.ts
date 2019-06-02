import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'secsToMins'
})

/**
 * it converts numbers to string formatted like 00:00
 */
export class SecsToMinsPipe implements PipeTransform {
    transform(secs: number): string {

        const m = Math.floor(secs / 60); // minutes
        const s = Math.floor(secs % 60); // seconds

        return (m > 9 ? m : '0' + m) + ':' + (s > 9 ? s : '0' + s);
    }
}
