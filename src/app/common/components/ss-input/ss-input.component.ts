import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'ss-input',
    templateUrl: 'ss-input.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SSInputComponent), multi: true }]
})

export class SSInputComponent {
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

    // private value
    _value: any = '';

    // getter
    get value(): any {
        return this._value;
    }

    // setter
    set value(v: any) {
        if (v !== this._value) {
            this._value = v;
            this.onChangeCallback(v);
        }
    }

    // from ControlValueAccessor interface
    writeValue(value: any): void {
        if (value !== this._value) {
            this._value = value;
        }
    }

    // from ControlValueAccessor interface
    registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }

    // from ControlValueAccessor interface
    registerOnTouched(fn: any): void {
        this.onTouchedCallback = fn;
    }

    // set touched on blur
    onBlur(): void {
        this.onTouchedCallback();
    }

    // placeholders for the callbacks which are later provided by the ControlValueAccessor
    onTouchedCallback: () => void = () => { };
    onChangeCallback: (_: any) => void = (_: any) => { };
}
