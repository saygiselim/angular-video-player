import { Component } from '@angular/core';

@Component({
    templateUrl: 'error-page.html',
    styleUrls: ['error-page.scss']
})
export class ErrorPageComponent {
    errorCode = 404;
    errorMessage = 'Not Found';
}
