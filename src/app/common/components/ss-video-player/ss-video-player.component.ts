import {
    Component,
    Input,
    ViewChild,
    AfterViewInit,
    ElementRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    OnDestroy,
    OnChanges,
    SimpleChanges
} from '@angular/core';

import { TrackerService } from '../../services/tracker.service';

// services

@Component({
    selector: 'ss-video-player',
    exportAs: 'ss-video-player',
    templateUrl: 'ss-video-player.html',
    styleUrls: ['ss-video-player.scss'],
    providers: [TrackerService],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SSVideoPlayerComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input() sources: Array<SSVideoSource>;
    @Input() config?: SSPlayerConfig;

    @ViewChild('videoWrapper') videoWrapper: ElementRef;
    @ViewChild('videoOverlay') videoOverlay: ElementRef;
    @ViewChild('video') videoRef: ElementRef;

    public selectedVideoSource: SSVideoSource;
    public selectedVideoSourceIndex = 0;

    public video: HTMLMediaElement;
    public isPlaying = false;
    public isInFullScreenMode = false;
    public volume = 100;
    public currentTime = 0;
    public duration = 0;
    public seekBarPercentage = 0;
    public overlayTimeoutInstance = null;
    public timeBeforeHide = 3000; // 3 seconds;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private trackerService: TrackerService
    ) {

        // let's give initial values to selectedVideoSource to prevent any null or undefined related errors
        this.selectedVideoSource = {
            title: '',
            source: '',
            poster: '',
            initialTime: 0,
        };

        // default config
        this.config = {
            autoplay: false,
            mute: false,
            loop: SSLoopType.None,
            trackUser: true
        };
    }

    ngAfterViewInit() {
        this.selectedVideoSource = this.sources[this.selectedVideoSourceIndex];
        this.video = this.videoRef.nativeElement;

        this.clearOverlayTimeout();

        // If everything has loaded, we can start to detect changes
        this.changeDetectorRef.detectChanges();

        document.addEventListener('webkitfullscreenchange', () => {
            this.isInFullScreenMode = document.webkitIsFullScreen;
        }, false);

        document.addEventListener('keydown', (event) => {
            if (event.keyCode === 32 && this.isInFullScreenMode) {
                this.togglePlayingState();
            }
        });

        this.volume = this.config.mute ? 0 : 100;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.sources) {
            if (this.selectedVideoSourceIndex >= this.sources.length - 1) {
                this.selectedVideoSourceIndex = 0;
                this.selectedVideoSource = this.sources[this.selectedVideoSourceIndex];
            }
        }
    }

    play(index?: number) {
        if (typeof index !== 'undefined' && this.sources.length > index) {
            this.stop();
            this.selectedVideoSourceIndex = index;
            this.selectedVideoSource = this.sources[this.selectedVideoSourceIndex];
        }

        this.video.play();
        this.isPlaying = true;

        this.clearOverlayTimeout(true);

        if (this.config.trackUser) {
            this.trackerService.startTracking(this.selectedVideoSource.title);
        }
    }

    pause() {
        this.video.pause();
        this.isPlaying = false;

        this.clearOverlayTimeout();

        if (this.config.trackUser) {
            this.trackerService.stopTracking();
        }
    }

    stop() {
        this.pause();
        this.skip((!this.selectedVideoSource.poster && this.selectedVideoSource.initialTime) || 0);
    }

    next() {
        this.pause();

        if (this.selectedVideoSourceIndex < this.sources.length - 1) {
            this.selectedVideoSourceIndex++;
        }

        this.selectedVideoSource = this.sources[this.selectedVideoSourceIndex];
    }

    prev() {
        this.pause();

        if (this.selectedVideoSourceIndex > 0) {
            this.selectedVideoSourceIndex--;
        }

        this.selectedVideoSource = this.sources[this.selectedVideoSourceIndex];
    }

    togglePlayingState() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    toggleVolumeState() {
        this.volume = this.volume > 0 ? 0 : 100;

        this.video.volume = this.volume / 100;
    }

    onVideoLoaded() {
        // This is needed for video duration otherwise duration variable of the video will be NaN (stands for not a number)
        // Also this will trigger the ontimeupdated event so we can update the currentTime and duration variables on load
        this.video.play();

        // if autoplay is true then we should not stop it;
        if (!this.config.autoplay && !this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }

        this.video.volume = this.volume ? 1 : 0;
    }

    onVideoPlaying() {

    }

    onVideoTimeUpdated() {
        this.currentTime = this.video.currentTime || 0;
        this.duration = this.video.duration || 0;
        this.seekBarPercentage = Math.floor((this.currentTime / this.duration) * 100);
    }

    onVideoEnded() {
        switch (this.config.loop) {

            case SSLoopType.Once:
                this.play();
                break;

            case SSLoopType.All:
                if (this.sources.length - 1 > this.selectedVideoSourceIndex) {
                    this.next();
                } else {
                    this.selectedVideoSourceIndex = 0;
                    this.selectedVideoSource = this.sources[this.selectedVideoSourceIndex];
                }
                setTimeout(() => {
                    this.play();
                }, 1000);
                break;

            case SSLoopType.None:
                this.stop();
                break;
        }
    }

    onVolumeChange(ev: MouseEvent) {
        const volumeBarHeight = ev.target['offsetHeight']; // Computed width of the volume bar element
        const ratio = (volumeBarHeight - ev.offsetY) / volumeBarHeight; // it will change between 0 and 1

        this.video.volume = ratio;
        this.volume = ratio * 100;
    }

    onVolumeChanging(ev: MouseEvent) {
        if (ev.buttons > 0) {
            this.onVolumeChange(ev);
        }
    }

    onSeek(ev: MouseEvent) {
        const seekBarWidth = ev.target['offsetWidth']; // Computed width of the seek bar element
        const ratio = ev.offsetX / seekBarWidth; // it will change between 0 and 1
        const computedPosition = this.duration * ratio;

        this.skip(computedPosition);
    }

    onSeeking(ev: MouseEvent) {
        if (ev.buttons > 0) {
            this.onSeek(ev);
        }
    }

    skip(value: number) {
        this.video.currentTime = value;
    }

    clearOverlayTimeout(reset?: boolean) {
        // Parent scope (that), it will be needed in setTimeout function
        // because scope of the setTimeout different than parent scope
        // so if we use "this" keyword in the function of setTimeout, it will give us the scope of the function (Window)
        // hence we will use "that" reference constant in the setTimeout.
        // Actually we can use lambda expression to create a function
        // and we can access the current scope with "this" but i will use this for an example.
        const that = this;

        this.videoOverlay.nativeElement.style.opacity = 0.8;
        this.videoOverlay.nativeElement.style.cursor = 'auto';

        if (this.overlayTimeoutInstance) {
            clearTimeout(this.overlayTimeoutInstance);
            this.overlayTimeoutInstance = null;
        }

        if (reset && this.isPlaying) {
            this.overlayTimeoutInstance = setTimeout(function () {
                that.videoOverlay.nativeElement.style.opacity = 0;
                that.videoOverlay.nativeElement.style.cursor = 'none';
            }, this.timeBeforeHide);
        }
    }

    toggleFullscreen() {
        const wrapper = this.videoWrapper.nativeElement;

        // for more information: https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreen
        if (!this.isInFullScreenMode) {
            if (wrapper.webkitRequestFullScreen) {
                wrapper.webkitRequestFullScreen();
            }
        } else {
            if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    }

    // Farewell to the life
    ngOnDestroy(): void {
        this.trackerService.stopTracking();
    }
}

export interface SSPlayerConfig {
    autoplay?: boolean;
    mute?: boolean;
    loop?: SSLoopType;
    trackUser?: boolean;
}

export enum SSLoopType {
    None,
    Once,
    All
}

export interface SSVideoSource {
    title: string; // Title of the video
    source: string; // Local or remote path of the video
    poster?: string; // Local or remote path of the poster image
    initialTime?: number; // Time in seconds, it will be useful when no poster image available for the video otherwise it will not work
}

export interface SSUserTrack {
    sessionId: string;
    videoTitle: string;
    totalWatchingTime: number;
}
