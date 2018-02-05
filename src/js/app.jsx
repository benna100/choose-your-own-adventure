import React from 'react';
import { render } from 'react-dom';
import renderHTML from 'react-render-html';
import SVGInline from 'react-svg-inline';
import InlineSound from './inline-sound';
import pageTurn from './../data/page-turn.mp3';
import iconSVG from './../images/svg/clock.svg';

console.log(iconSVG);
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
            }, 3600); // 3600
        }, 300);
    },
    restartAdventure() {
        (function smoothscroll(){
            const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
            if (currentScroll > 0) {
                window.requestAnimationFrame(smoothscroll);
                window.scrollTo (0, currentScroll - (currentScroll/5));
            }
        })();

        setTimeout(() => {
            this.setState({
                storyParts: [this.state.storyParts[0]],
                adventureFinished: 'hidden',
                choices: this.props.story.parts['1'].choices,
            });
        }, 100);
        inlineSound.turnAllSoundsDown();
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
                <section className={`intro ${this.state.clockState} ${this.state.introVisibility}`}>
                    <div className="wrapper">
                        <h1>Tidsmaskinen</h1>
                        <SVGInline svg={ "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n" +
                        "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n" +
                        "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
                        "     preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 640 640\">\n" +
                        "    <defs>\n" +
                        "        <path d=\"M332.76 0.25L339.12 0.56L345.46 0.99L351.77 1.55L358.06 2.23L364.32 3.02L370.55 3.94L376.75 4.98L382.91 6.14L389.05 7.42L395.15 8.82L401.21 10.33L407.24 11.97L413.22 13.71L419.17 15.58L425.08 17.56L430.94 19.66L436.76 21.86L442.53 24.19L448.26 26.63L453.94 29.18L459.56 31.84L465.14 34.61L470.66 37.5L476.14 40.49L481.55 43.6L486.91 46.81L492.21 50.13L497.45 53.56L502.63 57.1L507.75 60.75L512.8 64.5L517.79 68.36L522.71 72.32L527.57 76.39L532.35 80.56L537.07 84.83L541.71 89.21L546.28 93.69L550.76 98.26L555.14 102.9L559.42 107.62L563.59 112.4L567.66 117.26L571.62 122.18L575.48 127.17L579.23 132.22L582.88 137.34L586.42 142.52L589.85 147.76L593.18 153.06L596.39 158.42L599.5 163.83L602.49 169.3L605.38 174.83L608.15 180.4L610.81 186.03L613.37 191.71L615.8 197.44L618.13 203.21L620.34 209.03L622.43 214.89L624.42 220.8L626.28 226.75L628.03 232.73L629.66 238.76L631.18 244.83L632.58 250.93L633.86 257.06L635.01 263.23L636.05 269.43L636.97 275.66L637.77 281.92L638.45 288.2L639.01 294.51L639.44 300.85L639.75 307.21L639.94 313.6L640 320L639.94 326.4L639.75 332.78L639.44 339.14L639.01 345.48L638.45 351.79L637.77 358.07L636.97 364.33L636.05 370.56L635.01 376.75L633.86 382.92L632.58 389.05L631.18 395.15L629.66 401.21L628.03 407.24L626.28 413.23L624.42 419.17L622.43 425.08L620.34 430.94L618.13 436.76L615.8 442.53L613.37 448.26L610.81 453.93L608.15 459.56L605.38 465.14L602.49 470.66L599.5 476.13L596.39 481.55L593.18 486.91L589.85 492.21L586.42 497.45L582.88 502.63L579.23 507.74L575.48 512.8L571.62 517.79L567.66 522.71L563.59 527.56L559.42 532.35L555.14 537.07L550.76 541.71L546.28 546.28L541.71 550.76L537.07 555.14L532.35 559.42L527.56 563.59L522.71 567.66L517.79 571.62L512.8 575.48L507.74 579.23L502.62 582.88L497.44 586.42L492.2 589.85L486.9 593.18L481.54 596.39L476.13 599.5L470.66 602.49L465.13 605.38L459.56 608.15L453.93 610.81L448.25 613.37L442.52 615.8L436.75 618.13L430.93 620.34L425.07 622.43L419.16 624.42L413.22 626.28L407.23 628.03L401.2 629.66L395.14 631.18L389.04 632.58L382.91 633.86L376.74 635.01L370.54 636.05L364.31 636.97L358.06 637.77L351.77 638.45L345.46 639.01L339.12 639.44L332.76 639.75L326.38 639.94L319.98 640L313.58 639.94L307.2 639.75L300.84 639.44L294.51 639.01L288.2 638.45L281.91 637.77L275.66 636.97L269.43 636.05L263.23 635.01L257.07 633.85L250.94 632.58L244.84 631.18L238.78 629.66L232.75 628.03L226.76 626.28L220.82 624.42L214.91 622.43L209.05 620.34L203.23 618.13L197.46 615.8L191.74 613.36L186.06 610.81L180.43 608.15L174.86 605.38L169.33 602.49L163.86 599.5L158.45 596.39L153.09 593.17L147.79 589.85L142.55 586.42L137.37 582.88L132.25 579.23L127.2 575.48L122.21 571.62L117.29 567.66L112.43 563.59L107.65 559.41L102.93 555.14L98.29 550.76L93.72 546.28L89.24 541.71L84.86 537.06L80.58 532.35L76.41 527.56L72.34 522.71L68.38 517.79L64.52 512.8L60.77 507.74L57.12 502.62L53.58 497.44L50.15 492.2L46.82 486.9L43.61 481.55L40.5 476.13L37.51 470.66L34.62 465.14L31.85 459.56L29.19 453.93L26.63 448.25L24.2 442.53L21.87 436.76L19.66 430.94L17.57 425.08L15.58 419.17L13.72 413.22L11.97 407.24L10.34 401.21L8.82 395.15L7.42 389.05L6.14 382.92L4.99 376.75L3.95 370.55L3.03 364.33L2.23 358.07L1.55 351.79L0.99 345.48L0.56 339.14L0.25 332.78L0.06 326.4L0 320L0.06 313.6L0.25 307.21L0.56 300.85L0.99 294.52L1.55 288.2L2.23 281.92L3.03 275.66L3.95 269.43L4.99 263.23L6.14 257.06L7.42 250.93L8.82 244.83L10.34 238.76L11.97 232.74L13.72 226.75L15.58 220.8L17.57 214.9L19.66 209.03L21.87 203.21L24.2 197.44L26.63 191.71L29.19 186.03L31.85 180.41L34.62 174.83L37.51 169.3L40.5 163.83L43.61 158.42L46.82 153.06L50.15 147.76L53.58 142.52L57.12 137.34L60.77 132.22L64.52 127.17L68.38 122.18L72.34 117.26L76.41 112.4L80.58 107.62L84.86 102.9L89.24 98.26L93.72 93.69L98.29 89.21L102.93 84.83L107.65 80.56L112.43 76.39L117.29 72.32L122.21 68.36L127.2 64.5L132.25 60.75L137.37 57.1L142.55 53.56L147.79 50.13L153.08 46.81L158.44 43.6L163.86 40.49L169.33 37.5L174.85 34.61L180.43 31.84L186.05 29.18L191.73 26.63L197.46 24.19L203.23 21.86L209.05 19.66L214.91 17.56L220.81 15.58L226.76 13.71L232.75 11.97L238.77 10.33L244.83 8.82L250.93 7.42L257.06 6.14L263.23 4.98L269.43 3.94L275.65 3.02L281.91 2.23L288.19 1.55L294.5 0.99L300.84 0.56L307.2 0.25L313.58 0.06L319.98 0L326.38 0.06L332.76 0.25ZM295.96 27.64L284.14 28.84L272.47 30.51L260.94 32.64L249.58 35.21L238.38 38.21L227.37 41.65L216.54 45.5L205.92 49.75L195.5 54.41L185.3 59.46L175.33 64.88L165.59 70.68L156.1 76.83L146.86 83.34L137.9 90.18L129.2 97.36L120.79 104.86L112.67 112.68L104.86 120.8L97.36 129.21L90.18 137.9L83.33 146.87L76.83 156.11L70.67 165.6L64.88 175.34L59.45 185.31L54.41 195.51L49.75 205.93L45.5 216.56L41.64 227.38L38.21 238.4L35.21 249.59L32.64 260.96L30.51 272.48L28.84 284.16L27.64 295.98L26.91 307.93L26.67 320L26.91 332.07L27.64 344.02L28.84 355.84L30.51 367.52L32.64 379.04L35.21 390.41L38.21 401.6L41.64 412.62L45.5 423.44L49.75 434.07L54.41 444.49L59.45 454.69L64.88 464.66L70.67 474.4L76.83 483.89L83.33 493.13L90.18 502.1L97.36 510.79L104.86 519.2L112.67 527.32L120.79 535.14L129.2 542.64L137.9 549.82L146.86 556.66L156.1 563.17L165.59 569.32L175.33 575.12L185.3 580.54L195.5 585.59L205.92 590.25L216.54 594.5L227.37 598.35L238.38 601.79L249.58 604.79L260.94 607.36L272.47 609.49L284.14 611.16L295.96 612.36L307.91 613.09L319.98 613.33L332.05 613.09L344 612.36L355.82 611.16L367.5 609.49L379.03 607.36L390.39 604.79L401.59 601.79L412.6 598.35L423.43 594.5L434.06 590.25L444.48 585.59L454.68 580.54L464.65 575.12L474.39 569.32L483.88 563.17L493.12 556.66L502.09 549.82L510.79 542.64L519.2 535.14L527.32 527.32L535.13 519.2L542.63 510.79L549.81 502.1L556.66 493.13L563.17 483.89L569.32 474.4L575.12 464.66L580.54 454.69L585.59 444.49L590.24 434.07L594.5 423.44L598.35 412.62L601.79 401.6L604.79 390.41L607.36 379.04L609.49 367.52L611.16 355.84L612.36 344.02L613.09 332.07L613.33 320L613.09 307.93L612.36 295.98L611.16 284.16L609.49 272.48L607.36 260.96L604.79 249.59L601.79 238.4L598.35 227.38L594.5 216.56L590.24 205.93L585.59 195.51L580.54 185.31L575.12 175.34L569.32 165.6L563.17 156.11L556.66 146.87L549.81 137.9L542.63 129.21L535.13 120.8L527.32 112.68L519.2 104.86L510.79 97.36L502.09 90.18L493.12 83.34L483.88 76.83L474.39 70.68L464.65 64.88L454.68 59.46L444.48 54.41L434.06 49.75L423.43 45.5L412.6 41.65L401.59 38.21L390.39 35.21L379.03 32.64L367.5 30.51L355.82 28.84L344 27.64L332.05 26.91L319.98 26.67L307.91 26.91L295.96 27.64Z\"\n" +
                        "              id=\"b4JFdv3x9g\"></path>\n" +
                        "        <path d=\"M82.33 353.34C88.13 353.34 93.46 349.53 95.14 343.68C95.17 343.56 95.46 342.58 95.49 342.46C97.56 335.39 93.51 327.99 86.44 325.92C79.37 323.85 71.97 327.9 69.9 334.97C69.86 335.11 69.55 336.18 69.51 336.32C67.48 343.4 71.57 350.78 78.64 352.81C79.87 353.17 81.11 353.34 82.33 353.34Z\"\n" +
                        "              id=\"bls0yXNuH\"></path>\n" +
                        "        <path d=\"M153.25 438.54C153.65 431.19 148.01 424.9 140.66 424.5C133.31 424.11 127.02 429.74 126.62 437.09C126.61 437.23 126.55 438.36 126.55 438.5C126.19 445.86 131.87 452.11 139.22 452.46C139.44 452.47 139.66 452.48 139.88 452.48C146.94 452.48 152.84 446.93 153.18 439.79C153.2 439.54 153.24 438.66 153.25 438.54Z\"\n" +
                        "              id=\"d2CcOkyVsp\"></path>\n" +
                        "        <path d=\"M103.4 212.01C103.33 212.13 102.77 213.12 102.7 213.24C99.11 219.67 101.41 227.8 107.84 231.39C109.9 232.54 112.13 233.08 114.33 233.08C119.01 233.08 123.54 230.62 125.98 226.25C126.05 226.14 126.54 225.27 126.6 225.16C130.23 218.76 127.98 210.62 121.58 206.99C115.17 203.35 107.04 205.6 103.4 212.01Z\"\n" +
                        "              id=\"b10jTbWznS\"></path>\n" +
                        "        <path d=\"M544.99 344.21C546.85 349.8 552.05 353.34 557.64 353.34C559.03 353.34 560.45 353.11 561.85 352.65C568.84 350.32 572.62 342.77 570.29 335.79C570.25 335.65 569.89 334.59 569.84 334.45C567.48 327.48 559.91 323.75 552.94 326.11C545.96 328.47 542.22 336.04 544.59 343.02C544.67 343.25 544.95 344.09 544.99 344.21Z\"\n" +
                        "              id=\"abDun8VFC\"></path>\n" +
                        "        <path d=\"M534.11 455.16C534.22 455.11 535.15 454.76 535.26 454.72C542.15 452.11 545.62 444.41 543.01 437.52C540.4 430.64 532.71 427.17 525.82 429.78C525.69 429.83 524.62 430.24 524.49 430.29C517.62 432.94 514.21 440.66 516.86 447.53C518.91 452.82 523.95 456.06 529.3 456.06C530.9 456.06 532.53 455.77 534.11 455.16Z\"\n" +
                        "              id=\"b7Oy1po7e\"></path>\n" +
                        "        <path d=\"M326.65 88.4C327.09 88.44 327.52 88.46 327.95 88.46C334.74 88.46 340.54 83.3 341.21 76.41C341.91 69.08 336.55 62.56 329.22 61.85C329.08 61.84 327.95 61.73 327.81 61.72C320.48 61.04 313.99 66.46 313.32 73.79C312.65 81.13 318.06 87.61 325.4 88.28C325.65 88.3 326.53 88.38 326.65 88.4Z\"\n" +
                        "              id=\"awqdphxUV\"></path>\n" +
                        "        <path d=\"M464.25 124.6C457.98 120.74 449.77 122.69 445.9 128.96C442.04 135.23 443.99 143.44 450.26 147.31C450.37 147.38 451.25 147.92 451.36 147.99C453.55 149.35 455.98 149.99 458.38 149.99C462.83 149.99 467.19 147.76 469.72 143.69C473.6 137.43 471.68 129.21 465.42 125.33C465.19 125.18 464.37 124.68 464.25 124.6Z\"\n" +
                        "              id=\"b3uFMCdQuP\"></path>\n" +
                        "        <path d=\"M324.79 562.23C330.58 562.23 335.92 558.42 337.6 552.57C337.63 552.45 337.91 551.47 337.95 551.35C340.02 544.28 335.96 536.88 328.9 534.81C321.83 532.74 314.42 536.79 312.36 543.86C312.32 544 312 545.07 311.97 545.21C309.93 552.29 314.02 559.67 321.1 561.7C322.33 562.06 323.57 562.23 324.79 562.23Z\"\n" +
                        "              id=\"d2dE5lYBB8\"></path>\n" +
                        "        <path d=\"M530.39 221.15C524.12 217.29 515.91 219.24 512.04 225.51C508.18 231.78 510.13 239.99 516.4 243.85C516.51 243.92 517.39 244.46 517.5 244.53C519.69 245.89 522.12 246.54 524.52 246.54C528.97 246.54 533.33 244.3 535.86 240.24C539.74 233.98 537.82 225.76 531.56 221.88C531.33 221.73 530.51 221.22 530.39 221.15Z\"\n" +
                        "              id=\"dYczRJkVC\"></path>\n" +
                        "        <path d=\"M448.05 521.3C448.17 521.25 449.09 520.9 449.21 520.86C456.09 518.25 459.56 510.55 456.95 503.66C454.35 496.78 446.65 493.31 439.76 495.92C439.63 495.97 438.56 496.38 438.43 496.43C431.56 499.08 428.15 506.8 430.81 513.67C432.85 518.96 437.89 522.2 443.24 522.2C444.84 522.2 446.47 521.91 448.05 521.3Z\"\n" +
                        "              id=\"a3KjQPEEdM\"></path>\n" +
                        "        <path d=\"M225.65 513.45C226.05 506.1 220.41 499.81 213.06 499.41C205.7 499.02 199.42 504.65 199.02 512C199.01 512.14 198.95 513.27 198.95 513.41C198.59 520.77 204.26 527.02 211.62 527.38C211.84 527.39 212.06 527.39 212.27 527.39C219.34 527.39 225.24 521.84 225.58 514.7C225.59 514.45 225.64 513.58 225.65 513.45Z\"\n" +
                        "              id=\"a5z5XhFU1\"></path>\n" +
                        "        <path d=\"M181.01 128.92C180.95 129.04 180.39 130.03 180.32 130.15C176.73 136.58 179.03 144.71 185.45 148.3C187.51 149.45 189.74 149.99 191.95 149.99C196.62 149.99 201.16 147.53 203.6 143.16C203.66 143.05 204.15 142.18 204.21 142.07C207.84 135.67 205.6 127.53 199.19 123.9C192.79 120.26 184.65 122.51 181.01 128.92Z\"\n" +
                        "              id=\"isFSCOtIM\"></path>\n" +
                        "        <path d=\"M299.23 325.14C299.07 325.42 297.79 327.69 297.63 327.97C289.43 342.65 294.68 361.21 309.37 369.41C314.07 372.04 319.16 373.28 324.19 373.28C334.87 373.28 345.23 367.66 350.81 357.68C350.95 357.43 352.06 355.44 352.2 355.2C360.5 340.57 355.37 321.98 340.74 313.68C326.11 305.38 307.52 310.51 299.23 325.14Z\"\n" +
                        "              id=\"cGtyG21TM\"></path>\n" +
                        "        <path d=\"M444.31 328.34C447.49 328.34 450.07 330.92 450.07 334.1C450.07 338.21 450.07 344.78 450.07 348.89C450.07 352.07 447.49 354.65 444.31 354.65C420.37 354.65 354.34 354.65 330.4 354.65C327.22 354.65 324.64 352.07 324.64 348.89C324.64 344.78 324.64 338.21 324.64 334.1C324.64 330.92 327.22 328.34 330.4 328.34C354.34 328.34 420.37 328.34 444.31 328.34Z\"\n" +
                        "              id=\"b5VoQNDCS\"></path>\n" +
                        "        <path d=\"M510.85 327.02C515.92 327.03 520.03 331.16 520.02 336.24C520.01 339.66 520.01 340.74 520 344.16C519.99 349.24 515.86 353.35 510.78 353.34C472.62 353.24 367.33 352.99 329.17 352.9C324.09 352.89 319.99 348.76 320 343.68C320.01 340.26 320.01 339.18 320.02 335.76C320.03 330.68 324.16 326.57 329.23 326.58C367.4 326.68 472.69 326.93 510.85 327.02Z\"\n" +
                        "              id=\"cCWYYpGpc\"></path>\n" +
                        "    </defs>\n" +
                        "    <g>\n" +
                        "        <g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#b4JFdv3x9g\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#b4JFdv3x9g\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#bls0yXNuH\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#bls0yXNuH\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#d2CcOkyVsp\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#d2CcOkyVsp\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#b10jTbWznS\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#b10jTbWznS\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#abDun8VFC\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#abDun8VFC\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#b7Oy1po7e\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#b7Oy1po7e\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#awqdphxUV\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#awqdphxUV\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#b3uFMCdQuP\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#b3uFMCdQuP\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#d2dE5lYBB8\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#d2dE5lYBB8\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#dYczRJkVC\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#dYczRJkVC\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#a3KjQPEEdM\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#a3KjQPEEdM\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#a5z5XhFU1\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#a5z5XhFU1\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#isFSCOtIM\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#isFSCOtIM\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g>\n" +
                        "                <use xlink:href=\"#cGtyG21TM\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "                <g>\n" +
                        "                    <use xlink:href=\"#cGtyG21TM\" opacity=\"1\" fill-opacity=\"0\" stroke=\"#000000\" stroke-width=\"1\"\n" +
                        "                         stroke-opacity=\"0\"></use>\n" +
                        "                </g>\n" +
                        "            </g>\n" +
                        "            <g class=\"hour-hand\">\n" +
                        "                <use xlink:href=\"#b5VoQNDCS\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "            </g>\n" +
                        "            <g class=\"minute-hand\">\n" +
                        "                <use xlink:href=\"#cCWYYpGpc\" opacity=\"1\" fill=\"#000000\" fill-opacity=\"1\"></use>\n" +
                        "            </g>\n" +
                        "        </g>\n" +
                        "    </g>\n" +
                        "</svg>\n" } />
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
                        Af <a href="http://www.lol.dk" rel="author">{this.props.story.author}</a>
                    </span>
                    <div className="subStories">{this.renderStory()}</div>
                    <Navigation updateContent={this.updateContent} choices={this.state.choices} />
                    <div className={`result ${this.state.adventureFinished}`}>
                        <h1>Dit eventyr er færdigt</h1>
                        <p>Dette var blot 1 ud af mange eventyr. </p>
                        <button onClick={() => { this.restartAdventure(); }}>Prøv igen?</button>
                        <span>👇</span>
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
                                    <div className="response" id="mce-error-response"></div>
                                    <div className="response" id="mce-success-response"></div>
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
