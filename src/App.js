import React, { Component } from 'react';
import xml2js from 'xml2js';

import {
  request,
  // xmlToJson,
} from './helpers';

import GithubRibbon from './components/GithubRibbon';
import FixVersion from './components/FixVersion';
import FixMessage from './components/FixMessage';
import FixResult from './components/FixResult';

import './App.css';

class App extends Component {
  constructor() {
    super();

    this.loadAndParseFixXml = this.loadAndParseFixXml.bind(this);

    // initial state
    this.state = {
      fixVersion: [
        {
          version: '4.4',
          path: `${process.env.PUBLIC_URL}/FIX44.xml`,
        },
        // {
        //   version: '5.0',
        //   path: `${process.env.PUBLIC_URL}/FIX50.xml`,
        // }
      ],
      activeFixVersion: '4.4',
      activeFixParser: null,
    };
  }

  componentDidMount() {

  }

  loadAndParseFixXml(details) {
    const path = details.path;
    const version = details.version;
    console.log(`loadAndParseFixXml | ${path} | ${version}`);

    // update selected fix
    this.setState({
      activeFixVersion: version,
    });

    // request xml
    const xmlDoc = request(path);
    xmlDoc.then((xml) => {
      const parser = new xml2js.Parser();
      parser.parseString(xml, (err, result) => {
        console.log("version: ", version);

        console.log(result);
      });
    });

  }

  render() {
    return (
      <div className="App">
        <GithubRibbon
          githubLink="https://github.com/phoa/fix-decoder"
        />
        <div className="App-header">
          <h2>FIX Decoder</h2>
        </div>
        <div className="fix-version">
          <span className="fix-version-title">FIX Protocol</span>
          <ul className="fix-version-list">
            {
              this.state.fixVersion.map((item) => {
                return <FixVersion key={item.version} isSelected={ item.version === this.state.activeFixVersion } details={item} loadAndParseFixXml={this.loadAndParseFixXml} />
              })
            }
          </ul>
        </div>
        <FixMessage />
        <FixResult />
      </div>
    );
  }
}

export default App;
