import React from 'react';
import { Editor } from 'draft-js';

import './FixMessage.css';

class FixMessage extends React.Component {
  constructor () {
    super();
    this.editor = null;
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
