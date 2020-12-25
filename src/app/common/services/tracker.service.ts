import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';

import * as _ from 'lodash-es';
@Injectable()
export class TrackerService {
    private trackerPrefix = 'tracker_';
    private trackerID: string;
    private trackerTimer: any;
    private trackerObject: any = {};

    constructor(
        private sessionService: SessionService,
        private storageService: StorageService
    ) {
        this.trackerID = this.simpleIDGenerator(this.trackerPrefix);
        this.trackerObject = this.storageService.getObject(this.trackerID, {});
    }

    /**
     * You can tell to the tracker to start tracking.
     * @param videoTitle unique identifier for the video
     */
    startTracking(videoTitle: string): void {
        // to ensure it is stopped before start it again.
        this.stopTracking();
        this.trackerTimer = setInterval(() => this.track(videoTitle), 1000); // we should use one sec to correctly estimate watching times.
    }

    /**
     * If tracking is running and there is no video is playing, you should stop the tracker.
     */
    stopTracking(): void {
        if (this.trackerTimer) {
            clearInterval(this.trackerTimer);
            this.trackerTimer = null;
        }
    }

    /**
     * Every time this method called, it will increase the value of the duration that is belong to the tracked video.
     * @param videoTitle unique identifier for the video
     */
    private track(videoTitle: string): void {
        // this method generates object like <trackerID>:"{<sessionID>:{<videoTitle>:<duration>,...}}"
        const sessionObject = this.trackerObject[this.sessionService.sessionID];

        if (!sessionObject) {
            this.trackerObject[this.sessionService.sessionID] = {};
        }

        const videoObject = this.trackerObject[this.sessionService.sessionID][videoTitle];

        if (!videoObject) {
            this.trackerObject[this.sessionService.sessionID][videoTitle] = 0;
        }

        // we are adding one sec to the current data
        this.trackerObject[this.sessionService.sessionID][videoTitle] += 1;

        // after increment we should save data
        this.storageService.putObject(this.trackerID, this.trackerObject);

        console.log('Hey, i am ' + this.trackerID + ' and you are watching "' + videoTitle + '", right ?');
    }

    /**
     * You can get collected tracking data and play with them.
     */
    getTrackingData(): Array<TrackingInfo> {
        let trackingData: Array<TrackingInfo> = [];
        const rawTrackingData = [];

        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {

                if (key.indexOf(this.trackerPrefix) < 0) {
                    // If it is not a tracking key, we will skip it.
                    continue;
                }

                const trackerObject = this.storageService.getObject(key, {});

                for (const sessionID in trackerObject) {
                    if (trackerObject.hasOwnProperty(sessionID)) {
                        for (const title in trackerObject[sessionID]) {
                            if (trackerObject[sessionID].hasOwnProperty(title)) {
                                const statInfo = {
                                    sessionID,
                                    title,
                                    duration: trackerObject[sessionID][title]
                                };

                                rawTrackingData.push(statInfo);
                            }
                        }
                    }
                }
            }
        }

        if (rawTrackingData.length > 0) {
            // we should process raw data before use it and proper way to do this is grouping by title.
            trackingData = _.map(_.groupBy(rawTrackingData, 'title'), group => {
                const totalWatchingTime = _.sumBy(group, 'duration');
                const impression = group.length;

                const trackingInfo: TrackingInfo = {
                    title: group[0].title,
                    duration: totalWatchingTime,
                    impression: group.length,
                    durationPerImpression: Math.floor(totalWatchingTime / impression)
                };

                return trackingInfo;
            });
        }

        return trackingData;
    }

    /**
     * it generates a short random alphanumeric string.
     * @param prefix a short identifier for the key
     */
    private simpleIDGenerator(prefix: string): string {
        return prefix + Math.random().toString(36).substr(2, 9);
    }
}
export interface TrackingInfo {
    sessionID?: string; // Current session id
    title: string; // Title of the video
    duration: number; // Total number of watching times
    impression: number; // Total impression count
    durationPerImpression: number; // Duration per impression
}
