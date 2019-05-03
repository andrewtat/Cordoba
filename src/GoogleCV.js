import React, { Component } from 'react';

export default class GoogleCV extends Component {

    GoogleCV = {
        apiKey: 'AIzaSyD6UNdysR4q3Ux4mxQ1TOIBhwWpeI9K06E',
        endpoint: 'https://vision.googleapis.com/v1/images:annotate?key=',
        imageCap: 10
    }

    constructor(props) {
        super(props);
        this.state = {
            media: this.props.media,
            emotion: null,
            subjects: [],
            colors: []
        };
    }

    buildGoogleCVRequestImage(imageURL) {
        const image = {
            image: {
                source: {
                    imageUri: imageURL
                }
            },
            features: [
                {
                    type: "LABEL_DETECTION",
                    maxResults: 3
                }, 
                {
                    type: "IMAGE_PROPERTIES"
                },
                {
                    type: "FACE_DETECTION"
                }
            ]
        };
        return image;
    }

    buildGoogleCVRequests(media) {
        const requests = [];
        for (let i = 0; i < (media.length > this.GoogleCV.imageCap ? this.GoogleCV.imageCap : media.length); i++) {
            const imageURL = media[i].media_url;
            requests.push(this.buildGoogleCVRequestImage(imageURL));
        }
        return requests;
    }

    buildGoogleCVRequestBody(media) {
        const requestsList = {
            requests: this.buildGoogleCVRequests(media)
        };
        return requestsList;
    }

    postGoogleCVRequest() {
        const request = new Request(this.GoogleCV.endpoint + this.GoogleCV.apiKey, {method: 'POST', body: JSON.stringify(this.buildGoogleCVRequestBody(this.props.media))});
        fetch(request)
            .then(response => response.json())
            .then(results => {
                return results;
            });
    }

    componentDidMount() {
        this.postGoogleCVRequest();
    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div id="googlecv-results">
                <div id="sanity-check"><img src={this.props.media[0].media_url} height="400" /></div>
                <div id="emotion-result"></div>
                <div id="subjects-result"></div>
                <div id="colors-result"></div>
            </div>
        );
    }
}