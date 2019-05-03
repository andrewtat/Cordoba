import React, { Component } from 'react';

export default class User extends Component {

    constructor(props) {
        super(props);

        this.state = {
            user: this.props.user
        };
    }

    render() {
        return (
            <div id="bio">
                <div id="profile-picture">
                    <img src={this.state.user.profile_picture_url} width="400" height="400" />
                </div>
                <h1>{this.state.user.name}</h1>
                <h2>@{this.state.user.username}</h2>
                <div id="user-data">
                    <p>Follows: {this.state.user.follows_count}</p>
                    <p>Followers: {this.state.user.followers_count}</p>
                    <p>Posts: {this.state.user.media_count}</p>
                </div>
            </div>
        );
    }
}