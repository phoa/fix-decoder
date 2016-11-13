/**
 * Taken from
 * https://github.com/tholman/github-corners
 */

import React from 'react';
import Dropzone from 'react-dropzone';

import './FixVersionUpload.css';

class FixVersionUpload extends React.Component {
/**
        <a
          className="fix-version-upload-btn"
          href="#"
          onClick={(evt) => {
            evt.preventDefault();
            this.props.uploadXml();
          }}
        >
          <span>User Your Own Fix</span>
          <span>Click or drop your FIX XML file here.</span>
        </a>
 */

  render () {
    const details = this.props.details;
    const listClass = ['fix-version-upload'];
    let dropzoneCopy = (
      <div className="fix-version-copy">
        <span>Use Your Own FIX</span>
        <span>Click or drop your FIX XML file here.</span>
      </div>
    );
    if (details.get('status') !== 'waiting') {
      dropzoneCopy = (
        <div className="fix-version-copy">
          <span>Parsing {details.get('filename')}</span>
          <span>...{details.get('status')}</span>
        </div>
      );
    }
    return (
      <div className={listClass.join(' ')}>
        <Dropzone
          className="fix-version-upload-area"
          activeClassName="fix-version-upload-active"
          onDrop={this.props.uploadXml}
        >
          { dropzoneCopy }
        </Dropzone>

      </div>
    );
  }
}

FixVersionUpload.propTypes = {
  details: React.PropTypes.object,
  uploadXml: React.PropTypes.func,
};

export default FixVersionUpload
