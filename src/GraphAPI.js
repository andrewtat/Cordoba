import React, { Component } from 'react';

export default class GraphAPI extends Component {

    state = {
        accessToken: null,
        user: null
    }

    componentDidMount() {
        document.addEventListener('FBObjectReady', this.initializeFacebookLogin);
        document.addEventListener('FBAuthorized', this.getAccessToken);
    }

    componentWillUnmount() {
        document.removeEventListener('FBObjectReady', this.initializeFacebookLogin);
        document.removeEventListener('FBAuthorized', this.getAccessToken);
    }

    getAccessToken = () => {
        this.setState({
            accessToken: this.getCookieValue("access_token")
        });
    }

    getCookieValue(a) {
        var b = document.cookie.match('(^|[^;]+)\\s*' + a + '\\s*=\\s*([^;]+)');
        return b ? b.pop() : '';
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
            console.log("Logged in");
            this.FB.api('/me', userData => {
                return userData;
            });
        } else {
            console.log("Not logged in");
        }
    }

    render() {
        return (
            <div>
                {this.state.accessToken}
            </div>
        );
    }

}