import { Component, OnInit } from '@angular/core';
import { SSVideoSource, SSPlayerConfig, SSLoopType } from '../../common/components/ss-video-player/ss-video-player.component';

@Component({
    templateUrl: 'video-player-page.html'
})
export class VideoPlayerPageComponent implements OnInit {
    playerConfig: SSPlayerConfig;
    videoSources: Array<SSVideoSource> = [];
    videoSource: SSVideoSource = new SSVideoSource();

    ngOnInit() {
        this.playerConfig = {
            loop: SSLoopType.All,
            autoplay: false,
            trackUser: true
        };

        this.videoSources = [
            {
                title: 'Sintel',
                source: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
                poster: 'http://media.w3.org/2010/05/sintel/poster.png',
            }
        ];
    }

    addVideoSource(videoSource: SSVideoSource) {
        this.videoSources.push(videoSource);

        this.videoSource = videoSource;
    }

    removeVideoSource(index: number) {
        this.videoSources = this.videoSources.filter(vs => vs !== this.videoSources[index]);
    }
}
