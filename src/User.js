import React, { Component } from 'react';

import GoogleCV from './GoogleCV';

export default class User extends Component {

    constructor(props) {
        super(props);

        this.state = {
            user: this.props.user
        };
    }

    render() {
        // Filter out any non-images
        const userMedia = this.props.user.media.filter((media) => media.media_type === "IMAGE");
        return (
            <div id="user">
                <div id="bio">
                    <div id="profile-picture">
                        <img src={this.props.user.profile_picture_url} alt={this.props.user.name} width="400" height="400" />
                    </div>
                    <p>{this.props.user.name}</p>
                    <p>@{this.props.user.username}</p>
                    <div id="user-data">
                        <p>Follows: {this.props.user.follows_count}</p>
                        <p>Followers: {this.props.user.followers_count}</p>
                        <p>Posts: {this.props.user.media_count}</p>
                    </div>
                </div>
                <h1>Analysis</h1>
                <GoogleCV media={userMedia} />
            </div>
        );
    }
}