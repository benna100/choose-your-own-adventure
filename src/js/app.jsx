import React from 'react';
import { render } from 'react-dom';
import { Clip } from 'phonograph';

import '../styles/index.scss';


const clip = new Clip({
    url: './data/train-station.mp3',
    volume: 0.3,
});

clip.buffer().then(() => {
    //clip.play();
    //clip.pause();
});


function getStoryData() {
    return new Promise((resolve) => {
        require(['./tidsmaskinen.json'], (story) => {
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
                this.props.updateContent(choice.partId, choice.choiceText);
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
                <section className="story">
                    <div className="intro">
                        <h1 className="warning">ADVARSEL!</h1>
                        <br></br>
                        <p>
                            Denne bog er anderledes end andre bøger.<br></br>Dig og KUN dig alene har ansvaret for hvad der sker i denne historie.<br></br><br></br>Der er farer, valg, eventyr og konsekvenser. DU må bruge alle dine talenter og hele din enorme intelligens hvid du vil stå en chance.<br></br>Den forkerte beslutning kan ende forfærdeligt – Ja, med sleve døden,<br></br>MEN bare rolig, du kan til enhver tid gå tilbage og tage et andet valg og ændre din skæbne.<br></br><br></br>Velkommen til
                        </p>
                        <br></br>
                        <h1 className="title">
                            {this.props.story.title}
                        </h1>
                        <br></br>
                        <span>
                        Af <a rel="author">{this.props.story.author}</a>
                    </span>
                    </div>
                    <br></br>
                    <hr></hr>
                    <br></br>

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
