import React, { Component } from 'react';
import { Map, List, OrderedMap } from 'immutable';
import { EditorState, ContentState } from 'draft-js';

import { request, xmlToJson, cleanString } from './helpers';

import FixVersion from './components/FixVersion';
import FixVersionUpload from './components/FixVersionUpload';
import FixMessage from './components/FixMessage';
import FixResult from './components/FixResult';
import Delimiter from './components/Delimiter';
import Header from './components/Header';
import Footer from './components/Footer';

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
    this.findDelimiter = this.findDelimiter.bind(this);
    this.delimiterInputOnChange = this.delimiterInputOnChange.bind(this);

    this.state = {
      data: Map({
        fixVersionMap: OrderedMap({
          '44': {
            version: '4.4',
            path: `${process.env.PUBLIC_URL}/FIX44.xml`,
            filename: null,
            isCustom: false
          },
          '50': {
            version: '5.0',
            path: `${process.env.PUBLIC_URL}/FIX50.xml`,
            filename: null,
            isCustom: false
          }
        }),
        customVersionMap: OrderedMap({}),
        activeFixVersion: '4.4',
        uploadXmlDetails: Map({
          status: 'waiting',
          filename: null
        }),
        fixParserCollection: Map({}),
        delimiterList: List(['|', '^A', '^']),
        delimiterInput: null,
        delimiterUsed: null,
        editorState: EditorState.createEmpty(),
        decodedFixMessage: null
      })
    };
  }

  componentWillMount() {
    const defaultFixVersion = this.state.data.get('fixVersionMap').get('44');
    this.loadAndParseFixXml(defaultFixVersion);
  }

  uploadXml(files, rejectedFiles) {
    if (files.length > 0) {
      const file = files[0];
      const filename = file.name;
      let uploadXmlDetails = this.state.data.get('uploadXmlDetails');

      uploadXmlDetails = uploadXmlDetails
        .set('status', 'parsing')
        .set('filename', filename);
      this.setState(({ data }) => ({
        data: data.set('uploadXmlDetails', uploadXmlDetails)
      }));

      const reader = new FileReader();
      // Closure to capture the file information.
      reader.onload = e => {
        const xmlString = e.target.result;
        const parseXmlToJson = this._parseXml(xmlString);
        try {
          if (parseXmlToJson) {
            const customVersionMap = this.state.data.get('customVersionMap');
            const customVersion = `c-${customVersionMap.count() + 1}`;

            uploadXmlDetails = uploadXmlDetails.set('status', 'success');
            this.setState(({ data }) => ({
              data: data
                .setIn(['customVersionMap', customVersion], {
                  version: customVersion,
                  filename: cleanString(filename),
                  isCustom: true
                })
                .setIn(['fixParserCollection', customVersion], parseXmlToJson)
                .set('uploadXmlDetails', uploadXmlDetails)
            }));

            // use custom FIX
            const useCustomFixVersion = this.state.data
              .get('customVersionMap')
              .get(customVersion);
            this.loadAndParseFixXml(useCustomFixVersion);
          }
        } catch (err) {
          uploadXmlDetails = uploadXmlDetails.set('status', 'error');
          this.setState(({ data }) => ({
            data: data.set('uploadXmlDetails', uploadXmlDetails)
          }));
        }

        // reset upload state
        uploadXmlDetails = uploadXmlDetails
          .set('status', 'waiting')
          .set('filename', null);
        this.setState(({ data }) => ({
          data: data.set('uploadXmlDetails', uploadXmlDetails)
        }));
      };

      reader.readAsText(file);
    }
  }

  _parseXml(xmlString) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, 'text/xml');
    return xmlToJson(xml);
  }

  loadAndParseFixXml(details) {
    const { path, version } = details;

    // update selected fix
    this.setState(
      ({ data }) => {
        return {
          data: data.set('activeFixVersion', version)
        };
      },
      () => {
        // setState callback
        // only load and parse xml if parser for selected version does not exist
        const fixVersionParser = this.state.data.getIn([
          'fixParserCollection',
          version
        ]);
        const delimiterInput = this.state.data.get('delimiterInput');
        const delimiterUsed = this.state.data.get('delimiterUsed');
        const delimiter = delimiterInput || delimiterUsed;
        let curFixMessage;
        let decodedFixMessage = this.state.data.get('decodedFixMessage');
        if (!fixVersionParser) {
          // parser does not exist.. load and parse XML
          // request xml
          const xmlDoc = request(path, {
            mode: 'no-cors'
          });
          xmlDoc.then(xmlString => {
            const result = this._parseXml(xmlString);

            // check if there's any fix message to be re-coded
            curFixMessage = this.state.data
              .get('editorState')
              .getCurrentContent()
              .getPlainText();

            if (curFixMessage) {
              decodedFixMessage = this.decodeFixMessage(
                curFixMessage,
                delimiter,
                result
              );
            }

            this.setState(({ data }) => ({
              data: data
                .setIn(['fixParserCollection', version], result)
                .set('decodedFixMessage', decodedFixMessage)
            }));
          });
        } else {
          // parser exists
          // check if there's any fix message to be re-coded
          curFixMessage = this.state.data
            .get('editorState')
            .getCurrentContent()
            .getPlainText();

          if (curFixMessage) {
            decodedFixMessage = this.decodeFixMessage(
              curFixMessage,
              delimiter,
              fixVersionParser
            );
          }
          this.setState(({ data }) => ({
            data: data.set('decodedFixMessage', decodedFixMessage)
          }));
        }
      }
    );
  }

  delimiterInputOnChange(event) {
    const inputValue = event.target.value;
    let delimiterInput = inputValue;
    if (inputValue) {
      delimiterInput = inputValue[inputValue.length - 1];
    }

    // parse existing fix message if any

    const curFixMessage = this.state.data
      .get('editorState')
      .getCurrentContent()
      .getPlainText();
    let decodedFixMessage = this.state.data.get('decodedFixMessage');
    let delimiterUsed = this.state.data.get('delimiterUsed');
    if (curFixMessage) {
      if (!delimiterInput) {
        delimiterUsed = this.findDelimiter(curFixMessage);
      }

      const delimiter = delimiterInput || delimiterUsed;
      decodedFixMessage = this.decodeFixMessage(curFixMessage, delimiter);
    }

    this.setState(({ data }) => ({
      data: data
        .set('delimiterInput', delimiterInput)
        .set('delimiterUsed', delimiterUsed)
        .set('decodedFixMessage', decodedFixMessage)
    }));
  }

  editorOnChange(editorState) {
    const newFixMessage = editorState.getCurrentContent().getPlainText();
    const curFixMessage = this.state.data
      .get('editorState')
      .getCurrentContent()
      .getPlainText();

    const delimiterInput = this.state.data.get('delimiterInput');
    let decodedFixMessage = this.state.data.get('decodedFixMessage');
    let delimiterUsed = this.state.data.get('delimiterUsed');

    if (newFixMessage !== curFixMessage) {
      // fix message has changed, process it
      if (!delimiterInput) {
        delimiterUsed = this.findDelimiter(newFixMessage);
      }

      const delimiter = delimiterInput || delimiterUsed;

      // decode fix message
      decodedFixMessage = this.decodeFixMessage(newFixMessage, delimiter);
    }

    return this.setState(({ data }) => ({
      data: data
        .set('editorState', editorState)
        .set('delimiterUsed', delimiterUsed)
        .set('decodedFixMessage', decodedFixMessage)
    }));
  }

  editorHandlePastedText(text, html) {
    const removedLineBreaks = text.replace(/(\r\n|\n|\r)/gm, '');
    const newContent = ContentState.createFromText(removedLineBreaks);
    const newFixMessage = newContent.getPlainText();

    const curFixMessage = this.state.data
      .get('editorState')
      .getCurrentContent()
      .getPlainText();

    const delimiterInput = this.state.data.get('delimiterInput');
    let delimiterUsed = this.state.data.get('delimiterUsed');
    let decodedFixMessage = this.state.data.get('decodedFixMessage');

    if (newFixMessage !== curFixMessage) {
      // fix message has changed, process it
      if (!delimiterInput) {
        delimiterUsed = this.findDelimiter(newFixMessage);
      }

      const delimiter = delimiterInput || delimiterUsed;

      // decode fix message
      decodedFixMessage = this.decodeFixMessage(newFixMessage, delimiter);
    }

    this.setState(({ data }) => ({
      data: data
        .set('editorState', EditorState.createWithContent(newContent))
        .set('delimiterUsed', delimiterUsed)
        .set('decodedFixMessage', decodedFixMessage)
    }));

    return 'handled';
  }

  editorHandleReturn() {
    return 'handled';
  }

  findDelimiter(fixMessage) {
    if (fixMessage) {
      const delimiterList = this.state.data.get('delimiterList');
      let delimiterUsed = this.state.data.get('delimiterUsed');

      // check current delimiterUsed
      if (delimiterUsed !== null) {
        // test current delimiterUsed
        const equalOccurrences = fixMessage.split('=').length;
        const delimiterOccurences = fixMessage.split(delimiterUsed).length;
        if (
          equalOccurrences === delimiterOccurences ||
          equalOccurrences === delimiterOccurences + 1
        ) {
          // current delimiterUsed is most likely being used here
          return delimiterUsed;
        }
      }

      // no delimitterUsed before, find one

      // try pre-defined delimiterList
      delimiterUsed = delimiterList.find(item => {
        return fixMessage.indexOf(item) > -1;
      });

      if (delimiterUsed) {
        return delimiterUsed;
      }

      // unknown delimiter is most likely used
      // try to determine delimiter by getting the character before the BodyLength "9="
      const regex = new RegExp('([^a-zA-Z0-9])9=*');
      const execRegex = regex.exec(fixMessage);
      [, delimiterUsed] = execRegex || [];

      return delimiterUsed;
    }

    return null;
  }

  decodeFixMessage(fixMessage, delimiter, parser) {
    let decodedFixMessage;
    const invalidCode = `!!INVALID!!`;
    decodedFixMessage = fixMessage.split(delimiter).map(item => {
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
            isInvalid: true
          };
        }

        // valid syntax, process it

        const firstItem = splitEqual.shift().trim();
        const restOfSplit = [...splitEqual].join('=').trim();
        const rawTag = firstItem ? firstItem : invalidCode;
        const rawValue = restOfSplit ? restOfSplit : invalidCode;

        result.raw = {
          tag: rawTag,
          value: rawValue
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
            decodedValue = values[rawValue]
              ? values[rawValue].description
              : `${rawValue} (${invalidCode})`;
          }

          result.decoded = {
            tag: decodedTag,
            value: decodedValue
          };

          if (
            decodedTag === invalidCode ||
            decodedValue.indexOf(invalidCode) > -1
          ) {
            result.isInvalid = true;
          }
        }

        return result;
      } catch (err) {
        console.log('err: ', err);
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
    const delimiterUsed = this.state.data.get('delimiterUsed');
    const delimiterInput = this.state.data.get('delimiterInput');
    const allFixVersions = fixVersionMap.merge(customVersionMap).toArray();

    return (
      <div className="App">
        <Header />
        <FixVersion
          activeFixVersion={activeFixVersion}
          fixVersionList={allFixVersions}
          loadAndParseFixXml={this.loadAndParseFixXml}
        />
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
        {decodedFixMessage &&
          decodedFixMessage.length > 0 &&
          decodedFixMessage[0] !== null && (
            <Delimiter
              delimiterUsed={delimiterUsed}
              delimiterInput={delimiterInput}
              delimiterInputOnChange={this.delimiterInputOnChange}
            />
          )}
        <FixResult decodedFixMessage={decodedFixMessage} />
        <Footer />
      </div>
    );
  }
}

export default App;
