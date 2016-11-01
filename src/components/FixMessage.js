import React from 'react';
import { Editor } from 'draft-js';

import './FixMessage.css';

class FixMessage extends React.Component {
  constructor () {
    super();
    // this.state = {editorState: EditorState.createEmpty()};
    this.editor = null;
    // this.handleBeforeInput = (string) => {
    //   console.log("--- handleBeforeInput");
    //   console.log("string: ", string);
    // };
    // this.handleReturn = () => 'handled';
    // this.onChange = (editorState) => {
    //   console.log("--- onChange");
    //   const content = editorState.getCurrentContent();
    //   // const contentPlain = content.getPlainText();
    //   // const newContent = ContentState.createFromText(contentPlain);
    //   console.log("editorState: ", editorState.toJS());
    //   // console.log("content: ", content);
    //   console.log("content.getPlainText(): ", content.getPlainText());

    //   return this.setState({editorState});
    // };

    // this.handlePastedText = (text, html) => {
    //   console.log("--- handlePastedText");
    //   const removedLineBreaks = text.replace(/(\r\n|\n|\r)/gm,"");
    //   const newContent = ContentState.createFromText(removedLineBreaks);

    //   this.setState({
    //     editorState: EditorState.createWithContent(newContent),
    //   });

    //   return 'handled';
    // };
  }

  componentDidMount() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  render () {
    return (
      <div className="fix-message">
        <div className="fix-message-label">FIX Message</div>
        <Editor
          ref={(el) => {
            this.editor = el;
          }}
          placeholder="Enter your FIX message here..."
          editorState={this.props.editorState}
          onChange={this.props.editorOnChange}
          handlePastedText={this.props.editorHandlePastedText}
          handleReturn={this.props.editorHandleReturn}
        />
      </div>
    );
  }
}

FixMessage.propTypes = {
  editorState: React.PropTypes.object,
  editorOnChange: React.PropTypes.func,
  editorHandlePastedText: React.PropTypes.func,
  editorHandleReturn: React.PropTypes.func,
};

export default FixMessage
