import React, { Component } from 'react';
import { Map, OrderedMap } from 'immutable';
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
    // this.state = {
    //   fixVersion: {
    //     '4.4': {
    //       version: '4.4',
    //       path: `http://www.quickfixengine.org/FIX44.xml`,
    //     }
    //   }
    //   activeFixVersion: '4.4',
    //   activeFixParser: null,
    // };
    this.state = {
      data: Map({
        fixVersionMap: OrderedMap({
          '44': {
            version: '4.4',
            path: `${process.env.PUBLIC_URL}/FIX44.xml`,
          },
          '50': {
            version: '5.0',
            path: `${process.env.PUBLIC_URL}/FIX50.xml`,
          }
        }),
        activeFixVersion: '4.4',
        activeFixParser: null,
      })
    }
  }

  componentWillMount() {
    const defaultFixVersion = this.state.data.get('fixVersionMap').get('44');
    this.loadAndParseFixXml(defaultFixVersion);
  }

  loadAndParseFixXml(details) {
    console.log("details: ", details);
    const path = details.path;
    const version = details.version;
    console.log(`loadAndParseFixXml | ${path} | ${version}`);

    // update selected fix
    this.setState(({data}) => {
      console.log("data.get('activeFixVersion'): ", data.get('activeFixVersion'));
      return {
        data: data.update('activeFixVersion', v => version),
      }
    });

    // request xml
    const xmlDoc = request(path, {
      mode: 'no-cors'
    });
    xmlDoc.then((xml) => {
      const parser = new xml2js.Parser();
      parser.parseString(xml, (err, result) => {
        console.log("version: ", version);

        console.log('result: ', result);
        this.setState(({data}) => ({
          data: data.update('activeFixParser', v => result),
        }));
      });
    });

  }

  render() {
    const fixVersionMap = this.state.data.get('fixVersionMap');
    const activeFixVersion = this.state.data.get('activeFixVersion');

    const fixVersionList = fixVersionMap.keySeq().map((key) => {
      const item = fixVersionMap.get(key);
      const version = item.version;

      return <FixVersion key={version} isSelected={ version === activeFixVersion } details={item} loadAndParseFixXml={this.loadAndParseFixXml} />
    });

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
              fixVersionList
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
