import React, { Component } from 'react';

export default class GoogleCV extends Component {

    GoogleCV = {
        apiKey: 'AIzaSyBAMmZhH7zHjQCfVc2Kxd_cUCWJI80n7AU',
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

    parseBase64FromDataURL(dataURL) {
        const beginningOfBase64String = 23;
        if (dataURL) {
            return dataURL.substring(beginningOfBase64String);
        } else { // dataURL is undefined
            console.log("Nonexistent dataURL variable.");
        }
    }

    convertBlobToDataURL(imageBlob) {
        let dataURL;
        var reader = new FileReader();
        reader.onload = () => {
            dataURL = reader.result;
        };
        reader.readAsDataURL(imageBlob);
        return dataURL;
    }

    convertImageBytesToBase64(imageBuffer) {
        var binary = '';
        var imageBytes = new Uint8Array(imageBuffer);
        var imageLength = imageBytes.byteLength;
        for ( var i = 0; i < imageLength; i++) {
            binary += String.fromCharCode(imageBytes[i]);
        }
        return window.btoa(binary);
    }

    async getImageBuffer(imageURL) {
        return await fetch(imageURL)
            .then(response => {
                if (response.ok) {
                    return response.arrayBuffer();
                } else {
                    throw new Error('Network response was not ok.');
                }                
            })
            .catch(error => {
                console.log('There has been a problem with your fetch operation: ', error.message);
            });
    }

    getBase64Image(imageBuffer) {
        return this.convertImageBytesToBase64(imageBuffer);
    }

    async buildGoogleCVRequestImage(imageURL) {
        var imageBuffer = await this.getImageBuffer(imageURL); // Get image from Facebook in image buffer format
        var base64Image = this.getBase64Image(imageBuffer); // Convert image buffer to base64

        // Construct image JSON using base64 image
        const image = {
            image: {
                content: base64Image
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

    async buildGoogleCVRequests(media) {
        const requests = [];
        for (let i = 0; i < (media.length > this.GoogleCV.imageCap ? this.GoogleCV.imageCap : media.length); i++) {
            const imageURL = media[i].media_url;
            const image = await this.buildGoogleCVRequestImage(imageURL);
            requests.push(image);
        }
        return requests;
    }

    async buildGoogleCVRequestBody(media) {
        var requests = await this.buildGoogleCVRequests(media);
        const requestsList = {
            requests: requests
        };
        return requestsList;
    }

    async postGoogleCVRequest() {
        var requestsList = await this.buildGoogleCVRequestBody(this.props.media);
        const request = new Request(this.GoogleCV.endpoint + this.GoogleCV.apiKey, {method: 'POST', body: JSON.stringify(requestsList)});
        return await fetch(request)
            .then(response => response.json())
            .then(results => {
                return results;
            });
    }

    async componentDidMount() {
        var GoogleCVResults = await this.postGoogleCVRequest();
        console.log(GoogleCVResults);
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
