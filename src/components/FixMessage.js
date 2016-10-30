import React from 'react';
import {Editor, EditorState, ContentState} from 'draft-js';

import './FixMessage.css';

class FixMessage extends React.Component {
  constructor (props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.editor = null;
    this.onChange = (editorState) => {
      console.log("--- onChange");
      // const content = editorState.getCurrentContent();
      // const contentPlain = content.getPlainText();
      // const newContent = ContentState.createFromText(contentPlain);
      console.log("editorState: ", editorState.toJS());
      // console.log("content: ", content);
      // console.log("content.getPlainText(): ", content.getPlainText());

      return this.setState({editorState});
    };
    this.handleBeforeInput = (string) => {
      console.log("--- handleBeforeInput");
      console.log("string: ", string);
    };
    this.handleReturn = () => 'handled';
    this.handlePastedText = (text, html) => {
      console.log("--- handlePastedText");
      const removedLineBreaks = text.replace(/(\r\n|\n|\r)/gm,"");
      const newContent = ContentState.createFromText(removedLineBreaks);

      this.setState({
        editorState: EditorState.createWithContent(newContent),
      });

      return 'handled';
    };
  }

  componentDidMount() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  render () {
    const { editorState } = this.state;
    console.log("editorState: ", editorState);

    return (
      <div className="fix-message">
        <div className="fix-message-label">FIX Message</div>
        <Editor
          ref={(el) => {
            this.editor = el;
          }}
          placeholder="Enter your FIX message here..."
          editorState={editorState}
          onChange={this.onChange}
          handleBeforeInput={this.handleBeforeInput}
          handlePastedText={this.handlePastedText}
          handleReturn={this.handleReturn}
        />
      </div>
    );
  }
}

FixMessage.propTypes = {
  isSelected: React.PropTypes.bool,
  details: React.PropTypes.object,
  loadAndParseFixXml: React.PropTypes.func,
};

export default FixMessage
