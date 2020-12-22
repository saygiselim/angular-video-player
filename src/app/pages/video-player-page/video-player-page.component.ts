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
                title: 'Big Buck Bunny - 2008',
                poster: 'https://www.blender.org/wp-content/uploads/2013/07/poster-bigbuckbunny.jpg',
                source: 'https://download.blender.org/peach/bigbuckbunny_movies/big_buck_bunny_1080p_stereo.ogg'
            },
            {
                title: 'Sintel - 2010',
                poster: 'https://www.blender.org/wp-content/uploads/2013/07/poster-sintel.jpg',
                source: 'http://ftp.nluug.nl/pub/graphics/blender/demo/movies/Sintel.2010.1080p.mkv'
            },
            {
                title: 'Tears of Steel - 2012',
                poster: 'https://www.blender.org/wp-content/uploads/2013/07/poster-tearsofsteel.jpg',
                source: 'http://media.xiph.org/mango/tears_of_steel_1080p.webm'
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
