import { Clip } from 'phonograph';


const ScrollMagic = require('scrollmagic');


// setup the instance, pass callback functions
const controller = new ScrollMagic.Controller();

class InlineSound {
    constructor() {
        this.sounds = {};
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
                    clipToEnd,
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
                    if (this.soundOn === true) {
                        if (!this.sounds[soundId].clipEnd) {
                            this.sounds[soundId].clip.buffer()
                                .then(() => {
                                    this.sounds[soundId].isPlaying = true;
                                    this.sounds[soundId].clip.volume = 0;
                                    this.sounds[soundId].clip.loop = true;
                                    this.sounds[soundId].clip.play();

                                    this.easeInClip(soundId, 0, sound.volume, 4000, 20);
                                });
                        } else {
                            clearInterval(turnSoundUpInterval);
                            this.sounds[soundId].isPlaying = true;
                            this.easeInClip(this.sounds[soundId].clipToEnd, sound.volume, 0, 2000, 20);
                        }
                    }
                });
            }
        }
    }


    disableSounds() {
        for (const [soundId] of Object.entries(this.sounds)) {
            this.sounds[soundId].clip.pause();
        }
    }


    easeInClip(clipId, startVolume, endVolume, duration, frequency) {
        const clip = this.sounds[clipId].clip;
        clearInterval(this.soundIntervals[clipId]);
        const timeInterval = duration / frequency;
        let volume = startVolume;
        const volumeInterval = endVolume - startVolume;
        const volumeIncrement = volumeInterval / frequency;
        this.soundIntervals[clipId] = setInterval(() => {
            if (volumeInterval > 0) {
                volume += volumeIncrement;
                if (volume < endVolume) {
                    clip.volume = volume;
                } else {
                    clearInterval(this.soundIntervals[clipId]);
                }
            } else {
                volume += volumeIncrement;
                if (volume > endVolume) {
                    clip.volume = volume;
                } else {
                    clip.pause();
                    clearInterval(this.soundIntervals[clipId]);
                }
            }
        }, timeInterval);
    }
}

export default InlineSound;
