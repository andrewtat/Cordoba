import React, { Component } from 'react';
import './App.css';
import GraphAPI from './GraphAPI';

class App extends Component {

  state = {
    username: null
  };

  render() {
    const { username } = this.state;

    return (
      <div className="App">
        <GraphAPI />
      </div>
    );
  }
}

export default App;
