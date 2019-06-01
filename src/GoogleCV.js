import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class GoogleCV extends Component {

    displayResults(result) {
        // Create emotion result HTML
        const emotionResultHTML = (<p>Your most common emotion is {result.mostCommonEmotion}.</p>);

        // Create color result HTML
        const colorResultHTML = (<p>Your most common color is R:{result.mostDominantColor.color.red} G:{result.mostDominantColor.color.green} B:{result.mostDominantColor.color.blue}</p>);

        // Create labels result HTML
        const subjectResultHTML = (<p>Your most common subject is {result.mostCommonSubjects[0].description}.</p>);

        // Render results
        ReactDOM.render(emotionResultHTML, document.getElementById("emotion-result"));
        ReactDOM.render(colorResultHTML, document.getElementById("colors-result"));
        ReactDOM.render(subjectResultHTML, document.getElementById("subjects-result"));
    }

    async componentDidMount() {
        const ingestGoogleCVMediaIngestURL = new URL("http://localhost:5000/instagrammedia");
        const request = new Request(ingestGoogleCVMediaIngestURL, { 
            method: 'POST', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.props.media)
        });
        var analysis = await fetch(request).then(response => {
            return response.json();
        });
        this.displayResults(analysis);
    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div id="googlecv-results">
                <div id="emotion-result"></div>
                <div id="subjects-result"></div>
                <div id="colors-result"></div>
            </div>
        );
    }
}
