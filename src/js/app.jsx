import React from 'react';
import { render } from 'react-dom';
import renderHTML from 'react-render-html';
import SVGInline from 'react-svg-inline';
import InlineSound from './inline-sound';
import pageTurn from './../data/page-turn.mp3';
import iconSVG from './../images/inline-svg/clock.svg';

import '../styles/main.scss';


const createReactClass = require('create-react-class');

const inlineSound = new InlineSound();
inlineSound.soundOn = true;

const storyUpdated = () => {
    if (inlineSound.soundOn === true) {
        inlineSound.textHasChanged(document.querySelectorAll('.subStories p clip'));
    }
};

function getStoryData() {
    return new Promise((resolve) => {
        require(['../data/tidsmaskinen.json'], (story) => {
            resolve(story);
        });
    });
}

const Navigation = createReactClass({
    getInitialState() {
        return {
            buttonVisibility: 'visible',
        };
    },
    animateChoice() {
        return new Promise((resolve) => {
            this.setState({ buttonVisibility: 'hidden' });

            setTimeout(() => {
                resolve();
            }, 800);

            setTimeout(() => {
                this.setState({ buttonVisibility: 'visible' });
            }, 1875);
        });
    },
    choiceSelected(choice) {
        this.animateChoice()
            .then(() => {
                this.props.updateContent(choice.partId, choice.choiceText);
            });

        if (inlineSound.soundOn === true) {
            inlineSound.playSound(pageTurn, 300);
        }
    },
    render() {
        if (this.props.choices === 'undefined') {
            return (
                <div>hello</div>
            );
        }

        const buttons = this.props.choices.map((choice, i) => <button className={this.state.buttonVisibility} key={i} onClick={() => { this.choiceSelected(choice); }}>{choice.buttonText}</button>);

        return (
            <nav>
                {buttons}
            </nav>
        );
    },
});


const App = createReactClass({
    getInitialState() {
        const firstStory = this.props.story.parts['1'];
        const soundButtonVisible = ('AudioContext' in window) ? '' : 'no-sound';

        return {
            storyParts: [{
                text: firstStory.text,
                selectedButtonText: '',
                textVisible: 'visible',
                buttonVisibility: 'hidden',
            }],
            choices: firstStory.choices,
            soundPlaying: true,
            soundButtonText: 'Lyd til',
            soundClass: 'sound on',
            adventureFinished: 'hidden',
            introVisibility: 'visible',
            clockState: 'normal',
            soundButtonVisibility: soundButtonVisible,
        };
    },
    showSelectedText(selectedSubstories) {
        return new Promise((resolve) => {
            selectedSubstories[selectedSubstories.length - 1].textVisible = 'hidden';
            setTimeout(() => {
                selectedSubstories[selectedSubstories.length - 1].buttonVisibility = 'visible';
                this.setState({ storyParts: selectedSubstories });
            }, 100);


            this.setState({ storyParts: selectedSubstories });

            setTimeout(() => {
                resolve();
                selectedSubstories[selectedSubstories.length - 1].textVisible = 'visible';
                this.setState({ storyParts: selectedSubstories });
            }, 1000);

            setTimeout(() => {
                storyUpdated();
            }, 0);
        });
    },
    updateContent(partId, buttonText) {
        const selectedSubstory = this.props.story.parts[partId];
        const selectedSubstories = this.state.storyParts.slice();

        selectedSubstories.push({
            text: selectedSubstory.text,
            selectedButtonText: buttonText,
            textVisible: 'true',
            buttonVisibility: 'hidden',
        });

        if (selectedSubstory.choices !== undefined) {
            this.setState({
                choices: selectedSubstory.choices,
            });
        } else {
            this.setState({
                adventureFinished: 'visible',
                choices: [],
            });
        }

        this.showSelectedText(selectedSubstories);
    },
    toggleSound() {
        if (this.state.soundPlaying === true) {
            this.setState({
                soundButtonText: 'Lyd fra',
                soundPlaying: false,
                soundClass: 'sound off',
            });
            inlineSound.disableSounds();
            inlineSound.soundOn = false;
        } else {
            this.setState({
                soundButtonText: 'Lyd til',
                soundPlaying: true,
                soundClass: 'sound on',
            });
            inlineSound.soundOn = true;
        }
    },
    closeIntro() {
        inlineSound.soundOn = this.state.soundPlaying;
        this.setState({ clockState: 'clock-hidden' });
        setTimeout(() => {
            this.setState({ clockState: 'reverse' });
            setTimeout(() => {
                storyUpdated();
                this.setState({ introVisibility: 'hidden' });
            }, 200); // 3600
        }, 300);
    },
    restartAdventure() {
        (function smoothscroll() {
            const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
            if (currentScroll > 0) {
                window.requestAnimationFrame(smoothscroll);
                window.scrollTo(0, currentScroll - (currentScroll / 5));
            }
        }());

        setTimeout(() => {
            this.setState({
                storyParts: [this.state.storyParts[0]],
                adventureFinished: 'hidden',
                choices: this.props.story.parts['1'].choices,
            });
        }, 100);
        inlineSound.turnAllSoundsDown();
        setTimeout(() => {
            inlineSound.clips.trainStation.clip
                .buffer()
                .then(() => {
                    inlineSound.clips.trainStation.clip.volume = 0;
                    inlineSound.clips.trainStation.clip.play();
                    inlineSound.easeInClip(inlineSound.clips.trainStation.clip, 'trainStation', 0, 0.3);
                });
        }, 1000);
    },
    renderStory() {
        const storyToRender = (this.state.storyParts.map((subStory, i) => (
            <div>
                <span className={`choice ${subStory.buttonVisibility}`}>{subStory.selectedButtonText}</span>
                <p className={subStory.textVisible} key={i}>{renderHTML(subStory.text)}</p>
            </div>)));

        if (this.state.introVisibility === 'hidden') {
            setTimeout(() => {
                storyUpdated();
            });
        }

        return storyToRender;
    },
    render() {
        return (
            <div>
                <section className={`intro ${this.state.clockState} ${this.state.introVisibility} ${this.state.soundButtonVisibility}`}>
                    <div className="wrapper">
                        <h1>Tidsmaskinen</h1>
                        <SVGInline svg={iconSVG} />
                        <button className={this.state.soundClass} onClick={() => { this.toggleSound(); }} data-sound={this.state.soundButtonText} />
                        <span className={this.state.soundClass}>Slå lyden til for en forbedret oplevelse</span>
                        <button className="begin" onClick={() => { this.closeIntro(); }}>Start dit eventyr</button>
                    </div>
                </section>
                <div className={`overlay ${this.state.introVisibility} ${this.state.clockState}`} />
                <section className="adventure">
                    <h1 className="title">
                        {this.props.story.title}
                    </h1>
                    <span>
                        Af <span>{this.props.story.author}</span>
                    </span>
                    <div className="subStories">{this.renderStory()}</div>
                    <Navigation updateContent={this.updateContent} choices={this.state.choices} />
                    <div className={`result ${this.state.adventureFinished}`}>
                        <h1>Dit eventyr er færdigt</h1>
                        <p>Dette var blot 1 ud af mange eventyr. </p>
                        <button onClick={() => { this.restartAdventure(); }}>Prøv igen?</button>
                        <span role="img" aria-label="hand pointing down">👇</span>
                    </div>
                </section>
                <section className={`author ${this.state.adventureFinished}`} >
                    <img alt="Author" src="images/samuel.jpg" />
                    <p>Forfatteren Samuel D. Hughes er 28 år og bor i København, hvor han til daglig arbejder som lærer. </p>
                </section>
                <section className={`newsletter ${this.state.adventureFinished}`}>
                    <h1>Lige en sidste ting!</h1>
                    <p>Hvis du har lyst til at skrive en historie, i det her format, så send mig en mail på <a href="mailto:benjamin.dals.hughes@gmail.com">benjamin.dals.hughes@gmail.com</a></p>
                    <p>Hvis du vil holdes opdateret når der kommer nye historier, så skriv din mail her. No spam!</p>
                    <div id="mc_embed_signup">
                        <form action="https://github.us17.list-manage.com/subscribe/post?u=0286749bd5e9f7614d3653c4f&amp;id=e22dfd19bf" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" noValidate>
                            <div id="mc_embed_signup_scroll">

                                <div className="mc-field-group">
                                    <label htmlFor="mce-EMAIL">Skriv din mail her</label>
                                    <input type="email" name="EMAIL" placeholder="Email" className="required email" id="mce-EMAIL" />
                                </div>
                                <div id="mce-responses" className="clear">
                                    <div className="response" id="mce-error-response" />
                                    <div className="response" id="mce-success-response" />
                                </div>
                                <div aria-hidden="true"><input type="text" name="b_0286749bd5e9f7614d3653c4f_e22dfd19bf" tabIndex="-1" value="" /></div>
                                <div className="clear"><input type="submit" value="Hold mig opdateret" name="subscribe" id="mc-embedded-subscribe" className="button" /></div>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        );
    },
});

const Loader = createReactClass({
    render() {
        return (
            <div className="loader">
               Loading
            </div>
        );
    },
});

render(<Loader />, document.querySelector('main'));

getStoryData()
    .then((story) => {
        render(<App story={story} />, document.querySelector('main'));
    });
