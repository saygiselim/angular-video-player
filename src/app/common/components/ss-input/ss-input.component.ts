import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'ss-input',
    templateUrl: 'ss-input.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SSInputComponent), multi: true }]
})

export class SSInputComponent implements ControlValueAccessor {
    // features
    @Input() name: string;
    @Input() type: string;
    @Input() label: string;
    @Input() placeholder: string;
    @Input() readonly: boolean;
    @Input() disabled: boolean;

    // validations
    @Input() required: boolean;
    @Input() pattern: string;
    @Input() min: string;
    @Input() max: string;
    @Input() minlength: string;
    @Input() maxlength: string;

    private _value: any = '';

    get value(): any {
        return this._value;
    }

    set value(v: any) {
        if (v !== this._value) {
            this._value = v;
            this.onChangeCallback(v);
        }
    }

    writeValue(value: any): void {
        if (value !== this._value) {
            this._value = value;
        }
    }

    registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchedCallback = fn;
    }

    onBlur(): void {
        this.onTouchedCallback();
    }

    onTouchedCallback: () => void = () => { };
    onChangeCallback: (_: any) => void = (_: any) => { };
}
