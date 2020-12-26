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
    SimpleChanges,
    OnInit
} from '@angular/core';

import { TrackerService } from '../../services/tracker.service';

@Component({
    selector: 'ss-video-player',
    exportAs: 'ss-video-player',
    templateUrl: 'ss-video-player.html',
    styleUrls: ['ss-video-player.scss'],
    providers: [TrackerService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SSVideoPlayerComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    @Input() sources: SSVideoSource[] = [];
    @Input() config!: SSPlayerConfig;

    @ViewChild('videoWrapper') videoWrapper!: ElementRef;
    @ViewChild('videoOverlay') videoOverlay!: ElementRef;
    @ViewChild('video') videoRef!: ElementRef;

    selectedVideoSource!: SSVideoSource;
    selectedVideoSourceIndex = 0;

    video?: HTMLVideoElement;
    isPlaying = false;
    isInFullScreenMode = false;
    volume = 100;
    currentTime = 0;
    duration = 0;
    seekBarPercentage = 0;
    overlayTimeoutInstance: any;
    timeBeforeHide = 3000; // 3 seconds;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private trackerService: TrackerService
    ) { }

    ngOnInit(): void {
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

    ngAfterViewInit(): void {
        this.selectedVideoSource = this.sources[this.selectedVideoSourceIndex];
        this.video = this.videoRef?.nativeElement;

        this.clearOverlayTimeout();

        // If everything has loaded, we can start to detect changes
        this.changeDetectorRef.detectChanges();

        document.addEventListener('webkitfullscreenchange', () => {
            this.isInFullScreenMode = (document as any).webkitIsFullScreen;
        }, false);

        document.addEventListener('keydown', (event) => {
            if (event.key === ' ' && this.isInFullScreenMode) {
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

    play(index?: number): void {
        if (typeof index !== 'undefined' && this.sources.length > index) {
            this.stop();
            this.selectedVideoSourceIndex = index;
            this.selectedVideoSource = this.sources[this.selectedVideoSourceIndex];
        }

        this.video?.play();
        this.isPlaying = true;

        this.clearOverlayTimeout(true);

        if (this.config.trackUser) {
            this.trackerService.startTracking(this.selectedVideoSource.title);
        }
    }

    pause(): void {
        this.video?.pause();
        this.isPlaying = false;

        this.clearOverlayTimeout();

        if (this.config.trackUser) {
            this.trackerService.stopTracking();
        }
    }

    stop(): void {
        this.pause();
        this.skip((!this.selectedVideoSource?.poster && this.selectedVideoSource?.initialTime) || 0);
    }

    next(): void {
        this.pause();

        if (this.selectedVideoSourceIndex < this.sources.length - 1) {
            this.selectedVideoSourceIndex++;
        }

        this.selectedVideoSource = this.sources[this.selectedVideoSourceIndex];
    }

    prev(): void {
        this.pause();

        if (this.selectedVideoSourceIndex > 0) {
            this.selectedVideoSourceIndex--;
        }

        this.selectedVideoSource = this.sources[this.selectedVideoSourceIndex];
    }

    togglePlayingState(): void {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    toggleVolumeState(): void {
        this.volume = this.volume > 0 ? 0 : 100;

        if (this.video) {
            this.video.volume = this.volume / 100;
        }
    }

    onVideoLoaded(): void {
        // This is needed for video duration otherwise duration variable of the video will be NaN (stands for not a number)
        // Also this will trigger the ontimeupdated event so we can update the currentTime and duration variables on load
        this.video?.play();

        // if autoplay is true then we should not stop it;
        if (!this.config.autoplay && !this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }

        if (this.video) {
            this.video.volume = this.volume ? 1 : 0;
        }
    }

    onVideoPlaying(): void {

    }

    onVideoTimeUpdated(): void {
        this.currentTime = this.video?.currentTime || 0;
        this.duration = this.video?.duration || 0;
        this.seekBarPercentage = Math.floor((this.currentTime / this.duration) * 100);
    }

    onVideoEnded(): void {
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

    onVolumeChange(ev: MouseEvent): void {
        const volumeBarHeight = (ev.target as any).offsetHeight; // Computed width of the volume bar element
        const ratio = (volumeBarHeight - ev.offsetY) / volumeBarHeight; // it will change between 0 and 1

        if (this.video) {
            this.video.volume = ratio;
            this.volume = ratio * 100;
        }
    }

    onVolumeChanging(ev: MouseEvent): void {
        if (ev.buttons > 0) {
            this.onVolumeChange(ev);
        }
    }

    onSeek(ev: MouseEvent): void {
        const seekBarWidth = (ev.target as any).offsetWidth; // Computed width of the seek bar element
        const ratio = ev.offsetX / seekBarWidth; // it will change between 0 and 1
        const computedPosition = this.duration * ratio;

        this.skip(computedPosition);
    }

    onSeeking(ev: MouseEvent): void {
        if (ev.buttons > 0) {
            this.onSeek(ev);
        }
    }

    skip(value: number): void {
        if (this.video) {
            this.video.currentTime = value;
        }
    }

    clearOverlayTimeout(reset?: boolean): void {
        if (this.videoOverlay) {
            this.videoOverlay.nativeElement.style.opacity = 0.8;
            this.videoOverlay.nativeElement.style.cursor = 'auto';
        }

        if (this.overlayTimeoutInstance) {
            clearTimeout(this.overlayTimeoutInstance);
        }

        if (reset && this.isPlaying) {
            this.overlayTimeoutInstance = setTimeout(() => {
                this.videoOverlay.nativeElement.style.opacity = 0;
                this.videoOverlay.nativeElement.style.cursor = 'none';
            }, this.timeBeforeHide);
        }
    }

    toggleFullscreen(): void {
        const wrapper = this.videoWrapper.nativeElement;

        // for more information: https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreen
        if (!this.isInFullScreenMode) {
            if (wrapper.webkitRequestFullScreen) {
                wrapper.webkitRequestFullScreen();
            }
        } else {
            if ((document as any).webkitCancelFullScreen) {
                (document as any).webkitCancelFullScreen();
            }
        }
    }

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
