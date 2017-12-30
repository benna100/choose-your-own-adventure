import { Clip } from 'phonograph';

import trainStation from './../data/train-station.mp3';
import future from './../data/future.mp3';

const ScrollMagic = require('scrollmagic');


const sounds = {
    trainStation,
    future,
};

console.log(sounds);

// setup the instance, pass callback functions
const controller = new ScrollMagic.Controller();

class InlineSound {
    constructor() {
        this.sounds = {};
        this.clips = {};
        this.soundIntervals = {};
        this.soundOn = true;
    }

    playSound(fileName, offset = 0) {
        const pageTurnSound = new Clip({
            url: fileName,
            volume: 0.15,
        });

        setTimeout(() => {
            pageTurnSound.play();
        }, offset);
    }

    textHasChanged() {
        Array.prototype.slice.call(document.querySelectorAll('div.sound:not([data-processed])')).forEach((element) => {
            const scene = new ScrollMagic.Scene({
                triggerElement: element,
            }).addTo(controller);
            scene.triggerHook(0.9);
            scene.on('enter', (event) => {
                const triggerElement = event.currentTarget.triggerElement();
                const src = triggerElement.getAttribute('data-src');
                const volume = parseFloat(triggerElement.getAttribute('data-volume'));

                triggerElement.setAttribute('data-processed', true);

                if (!(src in this.clips)) {
                    const clip = new Clip({
                        url: sounds[src],
                        volume,
                    });

                    clip.buffer()
                        .then(() => {
                            clip.volume = 0;
                            clip.play();
                            this.easeInClip(clip, src, 0, volume, 4000, 20);
                        });

                    this.clips[src] = {
                        clip,
                        volume,
                    };
                } else {
                    this.easeInClip(this.clips[src].clip, src, this.clips[src].volume, volume, 4000, 20);
                }
            });
        });
    }


    disableSounds() {
        for (const [soundId] of Object.entries(this.sounds)) {
            this.sounds[soundId].clip.pause();
        }
    }


    easeInClip(clip, clipSrc, startVolume, endVolume, duration, frequency) {
        clearInterval(this.soundIntervals[clipSrc]);

        const timeInterval = duration / frequency;
        let volume = startVolume;

        const volumeInterval = endVolume - startVolume;
        const volumeIncrement = volumeInterval / frequency;
        this.soundIntervals[clipSrc] = setInterval(() => {
            if (volumeInterval > 0) {
                volume += volumeIncrement;
                if (volume < endVolume) {
                    clip.volume = volume;
                } else {
                    clearInterval(this.soundIntervals[clipSrc]);
                }
            } else {
                volume += volumeIncrement;
                if (volume > endVolume) {
                    clip.volume = volume;
                } else {
                    clip.pause();
                    clearInterval(this.soundIntervals[clipSrc]);
                }
            }
        }, timeInterval);
    }
}

export default InlineSound;
