import { Component } from '@angular/core';

@Component({
    templateUrl: 'error-page.html',
    styleUrls: ['error-page.scss']
})

export class ErrorPageComponent {
    public errorCode = 404;
    public errorMessage = 'Not Found';

}
