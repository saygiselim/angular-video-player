import { Component } from '@angular/core';
import { SSVideoSource, SSPlayerConfig, SSLoopType } from '../../common/components/ss-video-player/ss-video-player.component';

@Component({
    templateUrl: 'video-player-page.html'
})

export class VideoPlayerPageComponent {
    public playerConfig: SSPlayerConfig;
    public videoSources: Array<SSVideoSource> = [];

    public videoSource: SSVideoSource = {
        title: '',
        source: '',
        poster: '',
        initialTime: 0
    };

    constructor() {

        this.playerConfig = {
            loop: SSLoopType.All,
            autoplay: false,
            trackUser: true
        };

        this.videoSources = [
            {
                title: 'Portal 2',
                source: 'http://cdn.akamai.steamstatic.com/steam/apps/81613/movie480.mp4',
                poster: 'https://images3.alphacoders.com/143/thumb-1920-143009.jpg',
            },
            {
                title: 'Batman™: Arkham Knight',
                source: 'http://cdn.edgecast.steamstatic.com/steam/apps/2038213/movie_max.mp4',
                poster: 'http://cdn.akamai.steamstatic.com/steam/apps/208650/ss_88b07767c3d67b3d5be85fb27c97527770a98e7e.1920x1080.jpg'
            },
            {
                title: 'Mirror\'s Edge™',
                source: 'http://cdn.akamai.steamstatic.com/steam/apps/2029872/movie480.mp4',
                initialTime: 1
            },
            {
                title: 'Sonic CD',
                source: 'http://cdn.akamai.steamstatic.com/steam/apps/81368/movie480.webm',
                poster: 'http://cdn.akamai.steamstatic.com/steam/apps/200940/ss_5bfdc072048f8ad6596c7dfa474621e70ddc7db9.600x338.jpg'
            }
        ];
    }


    addVideoSource(videoSource: SSVideoSource) {
        this.videoSources.push(videoSource);

        this.videoSource = {
            title: '',
            source: '',
            poster: '',
            initialTime: 0
        };
    }

    removeVideoSource(index: number) {
        this.videoSources.splice(index, 1);
        this.videoSources = this.videoSources;
    }
}
