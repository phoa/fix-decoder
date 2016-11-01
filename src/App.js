import React, { Component } from 'react';
import { Map, OrderedMap } from 'immutable';
import {EditorState, ContentState} from 'draft-js';
// import xml2js from 'xml2js';

import {
  request,
  xmlToJson,
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
    this.editorOnChange = this.editorOnChange.bind(this);
    this.editorHandlePastedText = this.editorHandlePastedText.bind(this);
    this.editorHandleReturn = this.editorHandleReturn.bind(this);
    this.decodeFixMessage = this.decodeFixMessage.bind(this);

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
        editorState: EditorState.createEmpty(),
        decodedFixMessage: null,
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
    xmlDoc.then((xmlString) => {
      // console.log("xmlString: ", xmlString);
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlString, "text/xml");
      const result = xmlToJson(xml);
      console.log("result: ", result);


      // check if there's any fix message to be re-coded
      const curFixMessage = this.state.data.get('editorState').getCurrentContent().getPlainText();
      let decodedFixMessage = this.state.data.get('decodedFixMessage');

      if (curFixMessage) {
        decodedFixMessage = this.decodeFixMessage(curFixMessage, result);
      }

      this.setState(({data}) => ({
        data: data
          .set('activeFixParser', result)
          .update('decodedFixMessage', () => decodedFixMessage),
      }));

      // const parser = new xml2js.Parser();
      // parser.parseString(xml, (err, result) => {
      //   console.log("version: ", version);

      //   console.log('result: ', result);
      //   this.setState(({data}) => ({
      //     data: data.update('activeFixParser', v => result),
      //   }));
      // });
    });
  }

  editorOnChange(editorState) {
    console.log("--- onChange");
    // const content = editorState.getCurrentContent();
    // const contentPlain = content.getPlainText();
    // const newContent = ContentState.createFromText(contentPlain);
    // console.log("editorState: ", editorState.toJS());
    // console.log("content: ", content);
    // console.log("content.getPlainText(): ", content.getPlainText());

    const newFixMessage = editorState.getCurrentContent().getPlainText();
    const curFixMessage = this.state.data.get('editorState').getCurrentContent().getPlainText();

    let decodedFixMessage = this.state.data.get('decodedFixMessage');

    if (newFixMessage !== curFixMessage) {
      // fix message has changed, process it
      console.log("newFixMessage: ", newFixMessage);

      // decode fix message
      decodedFixMessage = this.decodeFixMessage(newFixMessage);
    }

    return this.setState(({data}) => ({
      // data: data.update('editorState', () => editorState),
      data: data
        .set('editorState', editorState)
        .update('decodedFixMessage', () => decodedFixMessage),
    }));
  };

  editorHandlePastedText(text, html) {
    console.log("--- handlePastedText");
    const removedLineBreaks = text.replace(/(\r\n|\n|\r)/gm,"");
    const newContent = ContentState.createFromText(removedLineBreaks);
    const newFixMessage = newContent.getPlainText();

    const curFixMessage = this.state.data.get('editorState').getCurrentContent().getPlainText();

    let decodedFixMessage = this.state.data.get('decodedFixMessage');

    if (newFixMessage !== curFixMessage) {
      // fix message has changed, process it
      console.log("newFixMessage: ", newFixMessage);

      // decode fix message
      decodedFixMessage = this.decodeFixMessage(newFixMessage);
    }

    this.setState(({data}) => ({
      data: data
        .set('editorState', EditorState.createWithContent(newContent))
        .update('decodedFixMessage', () => decodedFixMessage),
    }));

    return 'handled';
  };

  editorHandleReturn() {
    return 'handled';
  }

  decodeFixMessage(fixMessage, parser) {
    console.log("fixMessage: ", fixMessage);
    let decodedFixMessage;
    decodedFixMessage = fixMessage.split('|')
      .map((item) => {
        try {
          let result = null;
          const splitEqual = item.split('=');
          if (splitEqual.length !== 2) {
            // invalid syntax
            return result;
          }

          // valid syntax, process it

          result = {};

          const rawTag = splitEqual[0];
          const rawValue = splitEqual[1];

          result.raw = {
            tag: rawTag,
            value: rawValue,
          };

          const fixParser = parser || this.state.data.get('activeFixParser');

          if (fixParser) {
            const fields = fixParser.fields;
            const field = fields[rawTag];
            const decodedTag = field.name;
            const values = field.values;
            let decodedValue = rawValue;
            if (values && values[rawValue]) {
              // pre-defiend values exist
              decodedValue = values[rawValue].description;
            }

            result.decoded = {
              tag: decodedTag,
              value: decodedValue,
            }
          }

          return result;
        } catch(err) {
          console.log("err: ", err);
          return null;
        }
      });

    console.log("decodedFixMessage: ", decodedFixMessage);
    return decodedFixMessage;
  }

  render() {
    const fixVersionMap = this.state.data.get('fixVersionMap');
    const activeFixVersion = this.state.data.get('activeFixVersion');
    const editorState = this.state.data.get('editorState');
    const decodedFixMessage = this.state.data.get('decodedFixMessage');

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
        <FixMessage
          editorState={editorState}
          editorOnChange={this.editorOnChange}
          editorHandlePastedText={this.editorHandlePastedText}
          editorHandleReturn={this.editorHandleReturn}
        />
        <FixResult
          decodedFixMessage={decodedFixMessage}
        />
      </div>
    );
  }
}

export default App;
