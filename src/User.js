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
        return (
            <div id="user">
                <div id="bio">
                    <div id="profile-picture">
                        <img src={this.state.user.profile_picture_url} alt={this.state.user.name} width="400" height="400" />
                    </div>
                    <p>{this.state.user.name}</p>
                    <p>@{this.state.user.username}</p>
                    <div id="user-data">
                        <p>Follows: {this.state.user.follows_count}</p>
                        <p>Followers: {this.state.user.followers_count}</p>
                        <p>Posts: {this.state.user.media_count}</p>
                    </div>
                </div>
                <h1>Analysis</h1>
                <GoogleCV media={this.state.user.media} />
            </div>
        );
    }
}