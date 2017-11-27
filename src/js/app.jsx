import React from 'react';
import { render } from 'react-dom';

import '../styles/index.scss';
import '../styles/weather-fonts/css/weather-icons.min.css';
import moveToImport from 'moveTo';

const moveTo = new moveToImport();

window.moveTo = moveTo;


function getStoryData() {
    return new Promise((resolve) => {
        require(['./samuel.json'], (story) => {
            resolve(story);
        });
    });
}


const Navigation = React.createClass({
    getInitialState() {
        return {
            buttonVisibility: 'visible',
            selectedButtonText: '',
            selectedButtonTextVisibility: 'hidden',
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
                this.props.updateContent(choice.partId, choice.buttonText);
            });
    },
    render() {
        if (this.props.choices === 'undefined') {
            return (
              <div />
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


const audio = new Audio('data/train-station.mp3');

const App = React.createClass({
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
            soundPlaying: false,
            soundButtonText: 'Lyd til',
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

        this.setState({ storyParts: selectedSubstories });

        this.setState(this.state.storyParts);

        this.setState({
            choices: selectedSubstory.choices,
        });

        this.showSelectedText(selectedSubstories);
    },
    renderStory() {
        return (this.state.storyParts.map(
            (subStory, i) =>
                <div>
                    <span className={`choice ${subStory.buttonVisibility}`}>{subStory.selectedButtonText}</span>
                    <p className={subStory.textVisible} key={i}>{subStory.text}</p>
                    <hr></hr>
                </div>)
            );
    },
    toggleSound() {
        console.log(this.state.soundPlaying);
        if (this.state.soundPlaying === false) {
            audio.play();

            this.setState({ soundButtonText: 'Lyd fra' });
            this.setState({ soundPlaying: true });
        } else {
            console.log(4);
            audio.pause();
            this.setState({ soundButtonText: 'Lyd til' });
            this.setState({ soundPlaying: false });
        }

    },
    render() {
        return (
            <main>
                <section>
                    <h1>
                        {this.props.story.title}
                    </h1>
                    <span>
                        Af <a rel="author">{this.props.story.author}</a>
                    </span>
                    <button className="sound" onClick={() => { this.toggleSound(); }}>{this.state.soundButtonText}</button>
                    <div className="subStories">{this.renderStory()}</div>
                    <Navigation updateContent={this.updateContent} choices={this.state.choices} />
                </section>
          </main>
        );
    },
});


const Loader = React.createClass({
    render() {
        return (
          <div className="loader">
               Loading
            </div>
        );
    },
});

render(<Loader />, document.getElementsByClassName('app-container')[0]);

getStoryData()
    .then((story) => {
        render(<App story={story} />, document.getElementsByClassName('app-container')[0]);

    });
