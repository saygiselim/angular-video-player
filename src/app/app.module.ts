import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Route, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

// modules
import { AppCommonModule } from './common/app-common.module';

// pages
import { VideoStatisticsPageComponent } from './pages/video-statistics-page/video-statistics-page.component';
import { VideoPlayerPageComponent } from './pages/video-player-page/video-player-page.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';

// routes
const routes: Route[] = [
  { path: '', redirectTo: 'video-player', pathMatch: 'full' },
  { path: 'video-player', component: VideoPlayerPageComponent },
  { path: 'video-statistics', component: VideoStatisticsPageComponent },
  { path: '**', component: ErrorPageComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    VideoStatisticsPageComponent,
    VideoPlayerPageComponent,
    ErrorPageComponent
  ],
  imports: [
    BrowserModule,
    AppCommonModule,
    FormsModule,
    RouterModule.forRoot(routes, { useHash: false, relativeLinkResolution: 'legacy' })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
