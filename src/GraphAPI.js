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

    // getAccessToken = () => {
    //     this.setState({
    //         accessToken: this.exchangeToken(this.getCookieValue("access_token"))
    //     });
    // }

    // exchangeToken = accessToken => {
    //     const exchangeTokenURL = '/oauth/access_token?grant_type=fb_exchange_token&client_id=' + this.state.clientID + '&client_secret=' + this.state.clientSecret + '&fb_exchange_token=' + accessToken;
    //     this.FB.api(exchangeTokenURL, response => {
    //         return response.access_token;
    //     });
    // }

    // getCookieValue(a) {
    //     var b = document.cookie.match('(^|[^;]+)\\s*' + a + '\\s*=\\s*([^;]+)');
    //     return b ? b.pop() : '';
    // }

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
        // const accessToken = userData.data[0].access_token;
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
                <div>
                    <h1>{this.state.instagramUser.username}</h1>
                </div>
            );
        } else {
            return (
                <div>
                    <p>No user logged in</p>
                </div>
            );
        }
    }

}