import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class GoogleCV extends Component {

    /**
     * Returns the most dominant color JSON out of the passed in colors array
     * @param {Array} colors An array of color JSON objects
     */
    findMostDominantColor(colors) {
        var mostDominantColor = colors.reduce((highestFraction, color) => {
            return (highestFraction.pixelFraction || 0) > color.pixelFraction ? highestFraction : color;
        });
        return mostDominantColor;
    }

    /**
     * Processes a faceAnnotation object via likelihoodWeights and updates results in helpers
     * @param {*} faceAnnotation 
     * @param {*} helpers 
     * @param {*} likelihoodWeights 
     */
    processFaceAnnotation(faceAnnotation, helpers) {
        // Increase face count
        helpers.faces.count++;

        // Process likelihoods
        helpers.faces.emotions.anger += helpers.likelihoodWeights.filter((weight) => (weight.name === faceAnnotation.angerLikelihood))[0].value;
        helpers.faces.emotions.joy += helpers.likelihoodWeights.filter((weight) => (weight.name === faceAnnotation.joyLikelihood))[0].value;
        helpers.faces.emotions.sorrow += helpers.likelihoodWeights.filter((weight) => (weight.name === faceAnnotation.sorrowLikelihood))[0].value;
        helpers.faces.emotions.surprise += helpers.likelihoodWeights.filter((weight) => (weight.name === faceAnnotation.surpriseLikelihood))[0].value;

        helpers.faces.otherAttributes.blurred += helpers.likelihoodWeights.filter((weight) => (weight.name === faceAnnotation.blurredLikelihood))[0].value;
        helpers.faces.otherAttributes.headwear += helpers.likelihoodWeights.filter((weight) => (weight.name === faceAnnotation.headwearLikelihood))[0].value;
        helpers.faces.otherAttributes.underexposed += helpers.likelihoodWeights.filter((weight) => (weight.name === faceAnnotation.underExposedLikelihood))[0].value;

        // Process confidence
        helpers.faces.confidenceSum += faceAnnotation.detectionConfidence;

        // Process angle
        helpers.faces.angle.panSum += faceAnnotation.panAngle;
        helpers.faces.angle.rollSum += faceAnnotation.rollAngle;
        helpers.faces.angle.tiltSum += faceAnnotation.tiltAngle;
        
        // Process bounds
        
    }

    /**
     * Returns the emotion with the highest count, breaking ties in alphabetical order
     * @param {Object} emotions JSON object storing counts of emotions
     */
    getMostCommonEmotion(emotions) {
        return Object.keys(emotions).reduce((currentMostCommon, emotion) => emotions[currentMostCommon] > emotions[emotion] ? currentMostCommon : emotion);
    }

    labelsSetContains(uniqueLabels, labelAnnotation) {
        uniqueLabels.values().forEach(label => {
            if (label.mid === labelAnnotation.mid || label.description === labelAnnotation.description) {
                // Keep label with higher topicality
                if (label.topicality < labelAnnotation.topicality) {
                    uniqueLabels.delete(label);
                    uniqueLabels.add(labelAnnotation);
                }
                return true;
            }
        });
        return false;
    }

    processLabelAnnotations(labelAnnotations, helpers) {
        for(var i = 0; i < labelAnnotations.length; i++) {
            // If the current label has been seen, keep the one with the higher topicality. Else, add to unique labels seen
            if (!this.labelsSetContains(helpers.uniqueLabels, labelAnnotations[i])) {
                helpers.uniqueLabels.add(labelAnnotations[i]);
            }
        }
    }

    getNthHighestLabels(labels, n) {
        const sortedLabels = labels.values().sort((previous, current) => { // TODO: DUNNO IF THIS WILL WORK. NOT SURE OF TYPE FOR SORTEDLABELS
            return (current.topicality > previous.topicality) ? current : previous;
        });
        return sortedLabels.slice(0, n);
    }

    processImageAnalyses(images) {
        var helpers = {
            likelihoodWeights: [ // Declare likelihoodWeights once here so it's not instantiated every time in the upcoming forEach loop
                {
                    name: "UNKNOWN",
                    value: 0
                },
                {
                    name: "VERY_UNLIKELY",
                    value: 0
                },
                {
                    name: "UNLIKELY",
                    value: 0
                },
                {
                    name: "POSSIBLE",
                    value: 1
                },
                {
                    name: "LIKELY",
                    value: 2
                },
                {
                    name: "VERY_LIKELY",
                    value: 3
                },
            ],
            uniqueLabels: new Set(),
            dominantColors: [],
            faces: {
                count: 0,
                emotions: {
                    anger: 0,
                    joy: 0,
                    sorrow: 0,
                    surprise: 0
                },
                otherAttributes: {
                    blurred: 0,
                    headwear: 0,
                    underexposed: 0
                },
                angle: {
                    panSum: 0,
                    rollSum: 0,
                    tiltSum: 0
                },
                confidenceSum: 0,
                bounds: [ // Starts in the top-left and goes clockwise
                    { // 0: upper-left
                        xFractionSum: 0,
                        yFractionSum: 0
                    },
                    { // 1: upper-right
                        xFractionSum: 0,
                        yFractionSum: 0
                    },
                    { // 2: lower-right
                        xFractionSum: 0,
                        yFractionSum: 0
                    },
                    { // 3: lower-left
                        xFractionSum: 0,
                        yFractionSum: 0
                    }
                ]
            }
        }

        images.forEach(image => {
            // Process faceAnnotations
            this.processFaceAnnotation(image.faceAnnotations[0], helpers);

            // Process colors
            const imageColors = image.analysis.imagePropertiesAnnotation.dominantColors.colors;
            helpers.dominantColors.push(this.findMostDominantColor(imageColors));

            // Process labelAnnotations
            this.processLabelAnnotations(image.labelAnnotations, helpers);
        });

        var result = {
            mostCommonEmotion: (helpers.faces.count > 0) ? this.getMostCommonEmotion(helpers.faces.emotions) : null,
            mostDominantColor: this.findMostDominantColor(helpers.dominantColors),
            mostCommonSubjects: this.getNthHighestLabels(helpers.uniqueLabels, 3)
        };

        return result;
    }

    /**
     * Returns the JSON response from Google Cloud Vision
     * @param {Object} image A single Instagram post
     */
    async analyzeImage(imageURL) {
        // Construct Request object for Cordoba Server
        var imageAnalysisURL = new URL('http://localhost:5000/analyzeimage');
        const imageAnalysisParameters = {
            media_url: imageURL
        };
        imageAnalysisURL.search = new URLSearchParams(imageAnalysisParameters);

        // Using Cordoba Server, run Google Cloud Vision analysis engine on image
        const request = new Request(imageAnalysisURL, {method: 'GET'});
        var analysis = await fetch(request).then(response => {
            return response.json();
        });
        return analysis;
    }

    async packageImages(imageCap) {
        // var index = 0;
        // var images = [];

        const endIndex = (imageCap > this.props.media.length) ? this.props.media.length: imageCap;
        
        const images = this.props.media.slice(0, endIndex).map(async post => {
            // Create JSON object with media metadata and JSON analysis
            return await this.analyzeImage(post.media_url)
                .then(response => {
                    var image = {
                        instagramID: post.id,
                        likesCount: post.like_count,
                        timestamp: post.timestamp,
                        imageURL: post.media_url,
                        analysis: response
                    };
                    return image;
                });
        });

        // while (index < imageCap && index < this.props.media.length) {
        //     const imageURL = this.props.media[index].media_url;

        //     // Create JSON object with media metadata and JSON analysis
        //     var image = {
        //         instagramID: this.props.media[index].id,
        //         likesCount: this.props.media[index].like_count,
        //         timestamp: this.props.media[index].timestamp,
        //         imageURL: this.props.media[index].media_url,
        //         analysis: await this.analyzeImage(imageURL)[0]
        //     };

        //     images.push(image);

        //     index++;
        // }
        return await Promise.all(images);
    }

    /**
     * Analyses all of the images and parses out human readable outcomes 
     */
    async analyzeImages() {
        var images = await this.packageImages(4);
        return this.processImageAnalyses(images);
    }

    displayResults(result) {
        // Create emotion result HTML
        const emotionResultHTML = (<p>Your most common emotion is {result.mostCommonEmotion}.</p>);

        // Create color result HTML
        const colorResultHTML = (<p>Your most common emotion is {result.mostDominantColor}.</p>);

        // Create labels result HTML
        const subjectResultHTML = (<p>Your most common emotion is {result.mostCommonSubjects.toString()}.</p>);

        // Render results
        ReactDOM.render(emotionResultHTML, document.getElementById("emotion-result"));
        ReactDOM.render(colorResultHTML, document.getElementById("colors-result"));
        ReactDOM.render(subjectResultHTML, document.getElementById("subjects-result"));
    }

    async componentDidMount() {
        const result = this.analyzeImages();
        this.displayResults(result);
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
