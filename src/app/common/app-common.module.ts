import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

// components
import { SSVideoPlayerComponent } from './components/ss-video-player/ss-video-player.component';
import { SSDataChartComponent } from './components/ss-data-chart/ss-data-chart.component';

// pipes
import { SecsToMinsPipe } from './pipes/secs-to-mins.pipe';

// services
import { StorageService } from './services/storage.service';
import { SessionService } from './services/session.service';

@NgModule({
    declarations: [
        SSVideoPlayerComponent,
        SSDataChartComponent,
        SecsToMinsPipe
    ],
    imports: [
        BrowserModule,
        FormsModule
    ],
    exports: [
        SSVideoPlayerComponent,
        SSDataChartComponent,
        FormsModule
    ],
    providers: [
        // If we call the service in this section, it will be a shared service
        SessionService,
        StorageService
    ]
})
export class AppCommonModule { }
