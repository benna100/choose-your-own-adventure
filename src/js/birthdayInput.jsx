import React from 'react';

const BirthdayInput = React.createClass({
    getInitialState(){
        return {
            buttonDisabled: false,
            clickedButtons: {},
            showLoaderStyle: {
                display: 'none'
            }
        };
    },
    handleChange(event){
        let clickedButtons = this.state.clickedButtons;
        clickedButtons[event.target.className] = 1;
        this.setState(
            {
                clickedButtons: clickedButtons
            }
        );
        if (Object.keys(clickedButtons).length === 4) {
            this.setState(
                {
                    buttonDisabled: true,
                },
            );
        }
    },
    handleResultClick(event){

        event.preventDefault();
        this.refs.submitButton.classList.add('button--active');
        setTimeout((function() {
            this.refs.submitButton.classList.remove('button--active');
        }).bind(this), 70);
        this.props.handleResultClick(this.refs.dayInput, this.refs.monthInput, this.refs.yearInput, this.selectedCity);
    },
    citySelector(refName, event) {
        event.preventDefault();
        this.selectedCity = refName;
        this.refs.copenhagen_button.classList.remove('city-selector--active');
        this.refs.aarhus_button.classList.remove('city-selector--active');
        this.refs.odense_button.classList.remove('city-selector--active');
        this.refs.aalborg_button.classList.remove('city-selector--active');
        event.target.classList.add('city-selector--active');
    },
    render(){
        return (
          <div className="birthday-input">
            <span className="birthday-date-text">
                Min fødselsdag er den
            </span>
            <form onSubmit={this.handleResultClick}>
                <div className="birthdaysInput clearfix">
                    <input type="number" placeholder="Dag" ref="dayInput" className="dayInput" min="1" max="31" ontouchstart="" onChange={this.handleChange}/>
                    <select placeholder="Måned" onChange={this.handleChange} ref="monthInput" ontouchstart="" className="monthInput">
                        <option value="" disabled selected>Måned</option>
                        <option value="Januar">Januar</option>
                        <option value="Februar">Februar</option>
                        <option value="Marts">Marts</option>
                        <option value="April">April</option>
                        <option value="Maj">Maj</option>
                        <option value="Juni">Juni</option>
                        <option value="Juli">Juli</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="Oktober">Oktober</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                    </select>
                    <input type="number" min="1900" placeholder="År (fx 1989)" ontouchstart="" ref="yearInput" className="yearInput" onChange={this.handleChange} />
                    <span className="city-chooser-text">Jeg har haft <b>flest fødselsdage tæt på</b></span>
                    <button className="city-selector" ontouchstart="" ref="copenhagen_button" onClick={(event) => { this.citySelector("copenhagen", event); this.handleChange(event);}}>København</button>
                    <button className="city-selector" ontouchstart="" ref="aarhus_button" onClick={(event) => { this.citySelector("aarhus", event); this.handleChange(event);}}>Århus</button>
                    <button className="city-selector" ontouchstart="" ref="aalborg_button" onClick={(event) => { this.citySelector("aalborg", event); this.handleChange(event);}}>Aalborg</button>
                    <button className="city-selector" ontouchstart="" ref="odense_button" onClick={(event) => { this.citySelector("odense", event); this.handleChange(event);}}>Odense</button>
                
                </div>
                <br />
                <button ref="submitButton" className="clearfix submit-button" disabled={!this.state.buttonDisabled}>
                    Se solskins-fødselsdage!
                </button>
            </form>
          </div>
        )
    }
});


export default BirthdayInput;




