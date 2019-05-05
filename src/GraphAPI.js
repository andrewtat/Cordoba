import React, { Component } from 'react';
import User from './User';

export default class GraphAPI extends Component {

    state = {
        instagramUser: null
    }

    componentDidMount() {
        document.addEventListener('FBObjectReady', this.initializeFacebookLogin);
    }

    componentWillUnmount() {
        document.removeEventListener('FBObjectReady', this.initializeFacebookLogin);
    }

    initializeFacebookLogin = () => {
        this.FB = window.FB;
        this.checkLoginStatus();
    }

    checkLoginStatus = () => {
        this.FB.getLoginStatus(this.facebookLoginHandler);
    }

    facebookLogin = () => {
        if (!this.FB) return;

        this.FB.getLoginStatus(response => {
            if (response.status === 'connected') {
                this.facebookLoginHandler(response);
            } else {
                this.FB.login(this.facebookLoginHandler, {scope: 'public_profile, instagram_basic, manage_pages'});
            }
        });
    }

    facebookLoginHandler = response => {
        if (response.status === 'connected') {
            this.FB.api('/me/accounts?fields=access_token,connected_instagram_account', userData => {
                return this.setInstagramUserData(userData);
            });
        } else {
            console.log("Not logged in");
        }
    }

    setInstagramUserData = userData => {
        const instagramUserID = userData.data[0].connected_instagram_account.id;
        const instagramUserDataURL = '/' + instagramUserID + "?fields=name,username,profile_picture_url,followers_count,follows_count,media_count,media{id,caption,like_count,media_type,media_url,timestamp}";
        this.FB.api(instagramUserDataURL, instagramUserData => {
            const instagramUser = {
                name: instagramUserData.name,
                username: instagramUserData.username,
                profile_picture_url: instagramUserData.profile_picture_url,
                followers_count: instagramUserData.followers_count,
                follows_count: instagramUserData.follows_count,
                media_count: instagramUserData.media_count,
                media: instagramUserData.media.data
            };
            this.setState({
                instagramUser: instagramUser
            });
        });
    }

    render() {
        if (this.state.instagramUser) {
            return (
                <User user={this.state.instagramUser} />
            );
        } else {
            return (
                <div><p>No user logged in</p></div>
            );
        }
    }

}