import React from 'react';

import './FixResult.css';

class FixResult extends React.Component {
  render () {
    let content = null;

    if (this.props.decodedFixMessage) {
      content = this.props.decodedFixMessage.map((item, i) => {
        if (item === null) {
          return (<div key={i}></div>);
        }

        const raw = item.raw;
        const decoded = item.decoded;
        const isInvalid = item.isInvalid;

        const itemClass = ['fix-result-item'];
        if (isInvalid) {
          itemClass.push('invalid-item');
        }

        return (
          <div key={i}
            className={itemClass.join(' ')}
          >
            <div className="fix-result-col field-col">
              <span className="fix-result-label">Field</span>
              <span className="fix-result-value">{raw.tag}</span>
            </div>
            <div className="fix-result-col raw-col">
              <span className="fix-result-label">Raw Value</span>
              <span className="fix-result-value">{raw.value}</span>
            </div>
            <div className="fix-result-col desc-col">
              <span className="fix-result-label">Field Description</span>
              <span className="fix-result-value">{decoded.tag}</span>
            </div>
            <div className="fix-result-col val-col">
              <span className="fix-result-label">Value</span>
              <span className="fix-result-value">{decoded.value}</span>
            </div>
          </div>
        );
      });
    }

    return (
      <div className="fix-result">
        {content}
      </div>
    );
  }
}

FixResult.propTypes = {
  decodedFixMessage: React.PropTypes.any,
};

export default FixResult
