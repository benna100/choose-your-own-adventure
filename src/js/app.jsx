import React from 'react';
import { render } from 'react-dom';
import renderHTML from 'react-render-html';
import InlineSound from './inline-sound';

import '../styles/main.scss';

const createReactClass = require('create-react-class');

const inlineSound = new InlineSound();
let initialStoryHasRendered = false;
const storyUpdated = () => {
    if (inlineSound.soundOn === true) {
        console.log(4);
        inlineSound.textHasChanged(document.querySelectorAll('.subStories p .sound'));
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
            inlineSound.playSound('./data/page-turn.mp3', 300);
        }
    },
    render() {
        if (this.props.choices === 'undefined') {
            return (
                <div>hello</div>
            );
        }
        // console.log(this.props.choices);
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

        console.log(selectedSubstory.choices);

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
        console.log(this.state.soundPlaying);
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
    renderStory() {
        const storyToRender = (this.state.storyParts.map((subStory, i) =>
            <div>
                <span className={`choice ${subStory.buttonVisibility}`}>{subStory.selectedButtonText}</span>
                <p className={subStory.textVisible} key={i}>{renderHTML(subStory.text)}</p>
                <hr />
            </div>)
        );

        if (!initialStoryHasRendered) {
            setTimeout(() => {
                storyUpdated();
            });

            initialStoryHasRendered = true;
        }

        return storyToRender;
    },
    render() {
        return (
            <div>
                <div className="intro">
                    <h1 className="warning">ADVARSEL!</h1>
                    <br />
                    <p>
                            Denne bog er anderledes end andre bøger.<br />Dig og KUN dig alene har ansvaret for hvad der sker i denne historie.<br /><br />Der er farer, valg, eventyr og konsekvenser. DU må bruge alle dine talenter og hele din enorme intelligens hvid du vil stå en chance.<br />Den forkerte beslutning kan ende forfærdeligt – Ja, med sleve døden,<br />MEN bare rolig, du kan til enhver tid gå tilbage og tage et andet valg og ændre din skæbne.<br /><br />Velkommen til
                    </p>
                    <br />
                    <h1 className="title">
                        {this.props.story.title}
                    </h1>
                    <br />
                    <span>
                        Af <a href="http://www.lol.dk" rel="author">{this.props.story.author}</a>
                    </span>
                    <br />
                    <button className={this.state.soundClass} onClick={() => { this.toggleSound(); }} data-sound={this.state.soundButtonText} />
                    <br />
                    <span className={this.state.soundClass}>Slå lyden til for en forbedret oplevelse</span>
                </div>
                <br />
                <hr />
                <br />

                <div className="subStories">{this.renderStory()}</div>
                <Navigation updateContent={this.updateContent} choices={this.state.choices} />
                <div className={`result ${this.state.adventureFinished}`}>
                    <h1>Dit eventyr er færdigt</h1>
                    <p>Du oplevede 1 eventyr ud af 12. </p>
                    <button>prøv igen?</button>
                </div>
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

render(<Loader />, document.querySelector('section.adventure'));

getStoryData()
    .then((story) => {
        render(<App story={story} />, document.querySelector('section.adventure'));
    });
