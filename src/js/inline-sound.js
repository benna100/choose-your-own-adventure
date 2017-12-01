import { Clip } from 'phonograph';


const ScrollMagic = require('scrollmagic');


// setup the instance, pass callback functions
const controller = new ScrollMagic.Controller();

class InlineSound {
    constructor() {
        this.sounds = {};
        this.soundInterval;
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

    processHtmlToSounds(soundClipElements) {
        soundClipElements.forEach((soundClipElement) => {
            // console.log(soundClipElement);
            const soundClipId = soundClipElement.getAttribute('data-id');
            if (!(soundClipId in this.sounds)) {
                const src = soundClipElement.getAttribute('data-src');
                const volume = parseFloat(soundClipElement.getAttribute('data-volume'));
                const clipEnd = soundClipElement.getAttribute('data-clip-end') === 'true';
                const easeIn = soundClipElement.getAttribute('data-ease-in') === 'true';
                const clipToEnd = soundClipElement.getAttribute('data-clip-to-end');
                const clip = new Clip({
                    url: `./data/${src}`,
                    volume,
                });

                this.sounds[soundClipElement.getAttribute('data-id')] = {
                    src,
                    volume,
                    clip,
                    clipEnd,
                    easeIn,
                    clipToEnd
                };
            }
        });
    }

    textHasChanged(htmlWithSoundClips) {
        this.processHtmlToSounds(htmlWithSoundClips);

        for (const [soundId, sound] of Object.entries(this.sounds)) {
            if (!this.sounds[soundId].isPlaying) {
                console.log(this.sounds[soundId]);
                const scene = new ScrollMagic.Scene({
                    triggerElement: `div[data-id=${soundId}]`,
                }).addTo(controller);
                scene.triggerHook(0.9);
                let turnSoundUpInterval;
                scene.on('enter', () => {
                    if (!this.sounds[soundId].clipEnd) {
                        this.sounds[soundId].clip.buffer()
                            .then(() => {
                                this.sounds[soundId].isPlaying = true;
                                this.sounds[soundId].clip.volume = 0;
                                this.sounds[soundId].clip.play();

                                this.easeInClip(this.sounds[soundId].clip, 0, sound.volume, 4000, 20);
                            });
                    } else {
                        clearInterval(turnSoundUpInterval);
                        this.sounds[soundId].isPlaying = true;
                        this.easeInClip(this.sounds[this.sounds[soundId].clipToEnd].clip, sound.volume, 0, 2000, 20);
                    }
                });
            }
        }
    }

    easeInClip(clip, startVolume, endVolume, duration, frequency) {
        clearInterval(this.soundInterval);
        const timeInterval = duration / frequency;
        let volume = startVolume;
        const volumeInterval = endVolume - startVolume;
        const volumeIncrement = volumeInterval / frequency;
        this.soundInterval = setInterval(() => {
            if (volumeInterval > 0) {
                volume += volumeIncrement;
                if (volume < endVolume) {
                    clip.volume = volume;
                }
            } else {
                volume += volumeIncrement;
                if (volume > endVolume) {
                    clip.volume = volume;
                }
            }
        }, timeInterval);
    }
}

export default InlineSound;


// export default k = 12; // in file test.js
//
// import m from './test' // note that we got the freedom to use import m instead of import k, because k was default export
//
// console.log(m);        // will log 12
