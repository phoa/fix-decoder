import React, { Component } from 'react';
import GithubRibbon from './components/GithubRibbon';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <GithubRibbon
          githubLink="https://github.com/phoa/fix-decoder"
        />
        <div className="App-header">
          <h2>FIX Decoder</h2>
        </div>
        <p className="App-intro">
          Coming soon...
        </p>
      </div>
    );
  }
}

export default App;
