import React, { Component } from 'react';
import { Map, List, OrderedMap } from 'immutable';
import {EditorState, ContentState} from 'draft-js';

import {
  request,
  xmlToJson,
} from './helpers';

import GithubRibbon from './components/GithubRibbon';
import ReactIcon from './components/ReactIcon';
import FixVersion from './components/FixVersion';
import FixVersionUpload from './components/FixVersionUpload';
import FixMessage from './components/FixMessage';
import FixResult from './components/FixResult';

import './App.css';

/* example
8=FIX.4.2|1123=0|9=379|35=8|128=XYZ|34=28|49=CCG|56=ABC_DEFG01|52=20090325-14:28:10|55=CVS|37=NF 0568/03252009|11=NF 0568/03252009|17=NF 0568/03252009002002002|20=0|39=2|150=2|54=2|38=500|40=1|59=0|31=25.2800|32=400|4=0|6=0|151=0|60=20090325-14:28:12|58=Fill|30=N|76=0034|207=N|47=A|430=NX|9483=000007|9578=1|382=1|375=TOD|337=0000|437=400|438=1134|579=0000200002|9433=0034|29=1|63=0|9440=002002002|10=186|
 */

class App extends Component {
  constructor() {
    super();

    this.loadAndParseFixXml = this.loadAndParseFixXml.bind(this);
    this.uploadXml = this.uploadXml.bind(this);
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
        customVersionMap: OrderedMap({}),
        activeFixVersion: '4.4',
        uploadXmlDetails: Map({
          status: 'waiting',
          filename: null,
        }),
        fixParserCollection: Map({}),
        delimiter: List(['|', '^A', '^']),
        editorState: EditorState.createEmpty(),
        decodedFixMessage: null,
      })
    }
  }

  componentWillMount() {
    const defaultFixVersion = this.state.data.get('fixVersionMap').get('44');
    this.loadAndParseFixXml(defaultFixVersion);
  }

  uploadXml(files) {
    if (files.length > 0) {
      // const self = this;
      const file = files[0];
      const filename = file.name;
      let uploadXmlDetails = this.state.data.get('uploadXmlDetails');

      uploadXmlDetails = uploadXmlDetails
        .set('status', 'parsing')
        .set('filename', filename);
      this.setState(({data}) => ({
        data: data
          .set('uploadXmlDetails', uploadXmlDetails)
      }));

      const reader = new FileReader();
      // Closure to capture the file information.
      reader.onload = (e) => {
        const xmlString = e.target.result;
        const parseXmlToJson = this._parseXml(xmlString);
        try {
          if (parseXmlToJson) {
            const customVersionMap = this.state.data.get('customVersionMap');
            const customVersion = `c-${customVersionMap.count() + 1}`;

            uploadXmlDetails = uploadXmlDetails.set('status', 'success');
            this.setState(({data}) => ({
              data: data
                .setIn(['customVersionMap', customVersion], {
                  version: customVersion,
                })
                .setIn(['fixParserCollection', customVersion], parseXmlToJson)
                .set('uploadXmlDetails', uploadXmlDetails)
            }));

            // use custom FIX
            const useCustomFixVersion = this.state.data.get('customVersionMap').get(customVersion);
            this.loadAndParseFixXml(useCustomFixVersion);
          }
        } catch (err) {
          uploadXmlDetails = uploadXmlDetails.set('status', 'error');
          this.setState(({data}) => ({
            data: data
              .set('uploadXmlDetails', uploadXmlDetails)
          }));
        }

        // reset upload state
        setTimeout(() => {
          uploadXmlDetails = uploadXmlDetails
            .set('status', 'waiting')
            .set('filename', null)
          this.setState(({data}) => ({
            data: data
              .set('uploadXmlDetails', uploadXmlDetails)
          }));
        }, 3000);
      };

      reader.readAsText(file);
    }
  }

  _parseXml(xmlString) {
    // console.log("xmlString: ", xmlString);
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "text/xml");
    return xmlToJson(xml);
  }

  loadAndParseFixXml(details) {
    const path = details.path;
    const version = details.version;

    // update selected fix
    this.setState(({data}) => {
      return {
        data: data.update('activeFixVersion', v => version),
      }
    });

    // only load and parse xml if parser for selected version does not exist
    const fixVersionParser = this.state.data.getIn(['fixParserCollection', version]);
    let curFixMessage;
    let decodedFixMessage
    if (!fixVersionParser) {
      // parser does not exist.. load and parse XML
      // request xml
      const xmlDoc = request(path, {
        mode: 'no-cors'
      });
      xmlDoc.then((xmlString) => {
        // console.log("xmlString: ", xmlString);
        const result = this._parseXml(xmlString);
        // console.log("result: ", result);


        // check if there's any fix message to be re-coded
        curFixMessage = this.state.data.get('editorState').getCurrentContent().getPlainText();
        decodedFixMessage = this.state.data.get('decodedFixMessage');

        if (curFixMessage) {
          decodedFixMessage = this.decodeFixMessage(curFixMessage, result);
        }

        this.setState(({data}) => ({
          data: data
            .setIn(['fixParserCollection', version], result)
            .update('decodedFixMessage', () => decodedFixMessage),
        }));
      });
    } else {
      // parser exists
      // check if there's any fix message to be re-coded
      curFixMessage = this.state.data.get('editorState').getCurrentContent().getPlainText();

      if (curFixMessage) {
        decodedFixMessage = this.decodeFixMessage(curFixMessage, fixVersionParser);
      }
      this.setState(({data}) => ({
        data: data
          .update('decodedFixMessage', () => decodedFixMessage),
      }));
    }
  }

  editorOnChange(editorState) {
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
    const removedLineBreaks = text.replace(/(\r\n|\n|\r)/gm,"");
    const newContent = ContentState.createFromText(removedLineBreaks);
    const newFixMessage = newContent.getPlainText();

    const curFixMessage = this.state.data.get('editorState').getCurrentContent().getPlainText();

    let decodedFixMessage = this.state.data.get('decodedFixMessage');

    if (newFixMessage !== curFixMessage) {
      // fix message has changed, process it

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
    let decodedFixMessage;
    const invalidCode = `!!INVALID!!`;
    const delimiterList = this.state.data.get('delimiter');
    let delimiterUsed;
    delimiterUsed = delimiterList.find((item) => {
      return fixMessage.indexOf(item) > -1;
    });
    decodedFixMessage = fixMessage.split(delimiterUsed)
      .map((item) => {
        try {
          if (item === '') {
            // return null when it's empty
            return null;
          }

          let result = {};
          const splitEqual = item.split('=');
          // console.log("splitEqual: ", splitEqual);
          if (splitEqual.length !== 2) {
            // invalid syntax
            result = {
              isInvalid: true,
            };
          }

          // valid syntax, process it

          const firstItem = splitEqual.shift().trim();
          const restOfSplit = [...splitEqual].join('=').trim();
          const rawTag = firstItem ? firstItem : invalidCode;
          const rawValue = restOfSplit ? restOfSplit : invalidCode;

          result.raw = {
            tag: rawTag,
            value: rawValue,
          };

          let fixParser = null;
          if (parser) {
            fixParser = parser;
          } else {
            const version = this.state.data.get('activeFixVersion');
            fixParser = this.state.data.getIn(['fixParserCollection', version]);
          }

          if (fixParser) {
            // parser exists
            const fields = fixParser.fields;
            const field = fields[rawTag] || invalidCode;
            const decodedTag = field.name || invalidCode;
            const values = field.values;
            let decodedValue = rawValue || invalidCode;
            if (values) {
              // pre-defiend values exist
              decodedValue = values[rawValue] ? values[rawValue].description : `${rawValue} (${invalidCode})`;
            }

            result.decoded = {
              tag: decodedTag,
              value: decodedValue,
            }

            if (decodedTag === invalidCode || decodedValue.indexOf(invalidCode) > -1) {
              result.isInvalid = true;
            }
          }

          return result;
        } catch(err) {
          console.log("err: ", err);
          return null;
        }
      });

    return decodedFixMessage;
  }

  render() {
    const fixVersionMap = this.state.data.get('fixVersionMap');
    const customVersionMap = this.state.data.get('customVersionMap');
    const activeFixVersion = this.state.data.get('activeFixVersion');
    const editorState = this.state.data.get('editorState');
    const decodedFixMessage = this.state.data.get('decodedFixMessage');
    const uploadXmlDetails = this.state.data.get('uploadXmlDetails');

    let fixVersionList = fixVersionMap.keySeq().map((key) => {
      const item = fixVersionMap.get(key);
      const version = item.version;

      return <FixVersion key={version} isSelected={ version === activeFixVersion } details={item} loadAndParseFixXml={this.loadAndParseFixXml} />
    });
    let customFixVersionList = customVersionMap.keySeq().map((key) => {
      const item = customVersionMap.get(key);
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
            {
              customFixVersionList
            }
          </ul>
        </div>
        <FixVersionUpload
          details={uploadXmlDetails}
          uploadXml={this.uploadXml}
        />
        <FixMessage
          editorState={editorState}
          editorOnChange={this.editorOnChange}
          editorHandlePastedText={this.editorHandlePastedText}
          editorHandleReturn={this.editorHandleReturn}
        />
        <FixResult
          decodedFixMessage={decodedFixMessage}
        />
        <div className="footer-container">
          <p className="disclaimer">Everything here is processed locally, and stays in your browser.<br />Your data is not sent or stored in any servers.</p>
          <p className="madewith"><i className="material-icons">code</i> with <ReactIcon width={24} height={24} /></p>
          <p className="madeby">By <a href="https://sg.linkedin.com/in/pnphoa" target="_blank" className="madeby-link link-to-linkedin">Paul Nikolas Phoa</a><span className="madeby-divider">&bull;</span><a href="https://sg.linkedin.com/in/janaudy" target="_blank" className="madeby-link link-to-linkedin">Thierry Janaudy</a></p>
        </div>
      </div>
    );
  }
}

export default App;
