import React from 'react';

import './FixMessage.css';

class FixMessage extends React.Component {
  render () {
    return (
      <div className="fix-message">
        <div className="fix-message-label">FIX Message</div>
        <div className="fix-message-input">

        </div>
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
