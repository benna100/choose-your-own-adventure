import React from 'react';
import { render } from 'react-dom';

import BirthdayInput from './birthdayInput.jsx';
import '../styles/index.scss';
import '../styles/weather-fonts/css/weather-icons.min.css';
import moveToImport from 'moveTo';
const moveTo = new moveToImport();

window.moveTo = moveTo;

/*
import BirthdayResult from './birthdayResult.jsx';
*/

/*
function isTouchDevice() {
    return 'ontouchstart' in window        // works on most browsers
      || navigator.maxTouchPoints;       // works on IE10/11 and Surface
}


if (isTouchDevice()) {
    document.getElementsByTagName('body')[0].classList.add('touch');
}
*/



function getStoryData() {
    return new Promise((resolve, reject) => {
        require(["./benjamin.json"], function(story) {
            resolve(story);
        }); 
    });
}


const Navigation = React.createClass({
    render() {
        if(this.props.choices === 'undefined') {
             return (
                <div></div>
            );  
        }

        const buttons = this.props.choices.map((choice, i) => {
            return <button key={i} onClick={(event) => {this.props.updateContent(choice)}}>{choice.buttonText}</button>
        });       

        return (
            <nav>
                {buttons}
            </nav>
        );  
    },
});

const App = React.createClass({
    getInitialState() {
        const firstStory = this.props.story.story;

        return {
            content: [firstStory.text],
            choices: firstStory.choices,
        }
    },

    updateContent(selectedSubstory) {
        //this.state.content.push(selectedSubstory.text);

        var selectedSubstories = this.state.content.slice();
        selectedSubstories.push(selectedSubstory.text);
        this.setState({ content: selectedSubstories })

        this.setState(this.state.content);

        this.setState({
            choices: selectedSubstory.choices
        });
        
    },
    renderStory() {

        return(this.state.content.map((substory, i) => {
            return <p key={i}>{substory}</p>
        }));
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
                    <div className="subStories">{this.renderStory()}</div>
                    <Navigation updateContent={this.updateContent} choices={this.state.choices}/>
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


getStoryData()
    .then((story) => {
        render(<App story={story} />, document.getElementsByClassName('app-container')[0]);
    });

render(<Loader />, document.getElementsByClassName('app-container')[0]);


