import { Clip } from 'phonograph';

import trainStation from './../data/train-station.mp3';
import future from './../data/future.mp3';
import sirene from './../data/sirene.mp3';
import market from './../data/market.mp3';
import inn from './../data/inn.mp3';
import choir from './../data/choir.mp3';
import ending from './../data/story-ending.mp3';

console.log(choir);
const ScrollMagic = require('scrollmagic');


const sounds = {
    trainStation,
    future,
    sirene,
    market,
    inn,
    choir,
    ending,
};

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
        Array.prototype.slice.call(document.querySelectorAll('clip:not([data-processed])')).forEach((element) => {
            element.setAttribute('data-processed', true);
            const scene = new ScrollMagic.Scene({
                triggerElement: element,
            }).addTo(controller);

            scene.triggerHook(0.9);
            scene.on('enter', (event) => {
                const triggerElement = event.currentTarget.triggerElement();

                const src = triggerElement.getAttribute('data-src');
                const volume = parseFloat(triggerElement.getAttribute('data-volume'));

                if (!(src in this.clips)) {
                    const clip = new Clip({
                        url: sounds[src],
                        volume,
                        loop: true,
                    });

                    clip.buffer()
                        .then(() => {
                            clip.volume = 0;
                            clip.play();
                            this.easeInClip(clip, src, 0, volume, 4000);
                        });

                    this.clips[src] = {
                        clip,
                        volume,
                    };
                } else {
                    this.easeInClip(this.clips[src].clip, src, this.clips[src].volume, volume, 4000);
                }
            });
        });
    }

    turnAllSoundsDown() {
        setTimeout(() => {
            for (const clipSrc in this.clips) {
                if (this.clips.hasOwnProperty(clipSrc)) {
                    this.easeInClip(this.clips[clipSrc].clip, clipSrc, this.clips[clipSrc].volume, 0, 4000);
                }
            }
        }, 500);
    }

    disableSounds() {
        for (const [soundId] of Object.entries(this.sounds)) {
            this.sounds[soundId].clip.pause();
        }
    }


    easeInClip(clip, clipSrc, startVolume, endVolume, duration) {
        const frequency = 40;
        console.log(clipSrc, startVolume, endVolume);
        clearInterval(this.soundIntervals[clipSrc]);

        const timeInterval = duration / frequency;
        let volume = startVolume;

        const volumeInterval = endVolume - startVolume;
        const volumeIncrement = volumeInterval / frequency;
        this.soundIntervals[clipSrc] = setInterval(() => {
            volume += volumeIncrement;
            if (volumeInterval > 0) {
                if (volume < endVolume) {
                    this.clips[clipSrc].volume = volume;
                    // console.log(volume);
                    clip.volume = volume;
                } else {
                    clearInterval(this.soundIntervals[clipSrc]);
                }
            } else {
                if (volume > endVolume) {
                    // while changing volume remember to update volume on object, so transitions are smooth.
                    this.clips[clipSrc].volume = volume;
                    // console.log(volume);

                    clip.volume = volume;
                } else {
                    // clip.pause();
                    clearInterval(this.soundIntervals[clipSrc]);
                }
            }
        }, timeInterval);
    }
}

export default InlineSound;
