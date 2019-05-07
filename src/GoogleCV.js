import React, { Component } from 'react';

export default class GoogleCV extends Component {

    constructor(props) {
        super(props);
        this.state = {
            media: this.props.media,
            responses: null,
            emotion: {
                anger: 0,
                joy: 0,
                sorrow: 0,
                surprise: 0
            },
            subjects: [],
            colors: {
                red: null,
                green: null,
                blue: null
            }
        };
    }

    findMostDominantColor(colors) {
        var mostDominantColor = colors[0];
        for(var i = 1; i < colors.length; i++) {
            if (colors[i].pixelFraction > mostDominantColor.pixelFraction) {
                mostDominantColor = colors[i];
            }
        }
        return mostDominantColor;
    }

    addToEmotionsCount(faceAnnotations) {
        var scores = {
            POSSIBLE: 1,
            LIKELY: 2,
            VERY_LIKELY: 3
        };
        if (faceAnnotations.angerLikelihood === "POSSIBLE") {

        }
    }

    processImageAnalysis(results) {
        if (results.faceAnnotations) {
            this.addToEmotionsCount(results.faceAnnotations[0]);
        }

        var mostDominantColor = this.findMostDominantColor(results.imagePropertiesAnnotation.dominantColors.colors);

        var imageStats = {
            mostDominantColor: mostDominantColor,

        };
    }

    async analyzeImage(imageURL) {
        var imageAnalysisURL = new URL('http://localhost:5000/analyzeimage');
        const imageAnalysisParameters = {
            media_url: imageURL
        };
        imageAnalysisURL.search = new URLSearchParams(imageAnalysisParameters);

        const request = new Request(imageAnalysisURL, {method: 'GET'});
        var result = await fetch(request).then(response => response.json());
        return result;
    }

    async analyzeImages() {
        const imageCap = 4;
        var index = 0;
        var count = 0;
        while (index < this.state.media.length && count < this.state.media.length && count < imageCap) {
            if (this.state.media[index].media_type === "IMAGE") {
                const imageURL = this.state.media[index].media_url;
                var results = await this.analyzeImage(imageURL);
                console.log(results.responses[0]);

                count++;
            }
            index++;
        }
    }

    async componentDidMount() {
        this.analyzeImages();
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
