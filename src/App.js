import React, { Component } from 'react';
import { Map, OrderedMap } from 'immutable';
import {EditorState, ContentState} from 'draft-js';

import {
  request,
  xmlToJson,
} from './helpers';

import GithubRibbon from './components/GithubRibbon';
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
        activeFixVersion: '4.4',
        uploadXmlDetails: Map({}),
        fixParserCollection: Map({}),
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
      const file = files[0];
      const filename = file.name;

      this.setState(({data}) => ({
        data: data
          .setIn(['uploadXmlDetails', 'filename'], filename)
      }));

      // const reader = new FileReader();
      // // Closure to capture the file information.
      // reader.onload = (function(theFile) {
      //   return function(e) {
      //     const filename = theFile.name;
      //   };
      // })(file);
    }
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
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlString, "text/xml");
        const result = xmlToJson(xml);
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
    decodedFixMessage = fixMessage.split('|')
      .map((item) => {
        try {
          if (item === '') {
            // return null when it's empty
            return null;
          }

          let result = {};
          const splitEqual = item.split('=');
          if (splitEqual.length !== 2) {
            // invalid syntax
            result = {
              isInvalid: true,
            };
          }

          // valid syntax, process it

          const rawTag = splitEqual[0] ? splitEqual[0].trim() : invalidCode;
          const rawValue = splitEqual[1] ? splitEqual[1].trim() : invalidCode;

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
    const activeFixVersion = this.state.data.get('activeFixVersion');
    const editorState = this.state.data.get('editorState');
    const decodedFixMessage = this.state.data.get('decodedFixMessage');
    const uploadXmlDetails = this.state.data.get('uploadXmlDetails');

    let fixVersionList = fixVersionMap.keySeq().map((key) => {
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
      </div>
    );
  }
}

export default App;
