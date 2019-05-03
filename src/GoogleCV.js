import React, { Component } from 'react';

export default class GoogleCV extends Component {
    constructor(props) {
        super(props);
        this.state = {
            media: this.props.media,
            emotion: null,
            subjects: [],
            colors: []
        };
    }

    componentDidMount() {

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