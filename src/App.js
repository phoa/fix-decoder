import React, { Component } from 'react';
import { fromJS } from 'immutable';

import {
  request,
  xmlToJson,
} from './helpers';

import GithubRibbon from './components/GithubRibbon';
import FixVersion from './components/FixVersion';

import './App.css';

class App extends Component {
  constructor() {
    super();

    this.loadAndParseFixXml = this.loadAndParseFixXml.bind(this);

    // initial state
    this.state = fromJS({
      fixVersion: [
        {
          version: '4.4',
          path: `${process.env.PUBLIC_URL}/FIX44.xml`,
        },
        {
          version: '5.0',
          path: `http://www.quickfixengine.org/FIX50.xml`,
        }
      ],
      activeFixParser: null,
    });
  }

  loadAndParseFixXml(path) {
    console.log(`loadAndParseFixXml ${path}`);
    const xmlDoc = request(path);
    xmlDoc.then((xml) => {
      console.log("typeof data: ", typeof xml);
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const x = xmlToJson(doc);
      console.log("x: ", x);
    })

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
          <ul>
            {
              this.state.get('fixVersion').map((item) => {
                return <FixVersion key={item.get('version')} details={item} loadAndParseFixXml={this.loadAndParseFixXml} />
              })
            }
          </ul>
        </div>
        <p className="App-intro">
          Coming soon...
        </p>
      </div>
    );
  }
}

export default App;
