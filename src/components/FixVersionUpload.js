import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';

import './FixVersionUpload.css';

function FixVersionUpload(props) {
  const { details, uploadXml } = props;
  const status = details.get('status');
  const isIdle = status === 'waiting';

  const listClass = ['fix-version-upload'];

  const dropzoneCopyFn = ({
    isDragAccept,
    isDragReject,
    acceptedFiles,
    rejectedFiles
  }) => {
    if (isDragReject) {
      return (
        <div className="fix-version-copy">
          <span>One XML file at a time, please.</span>
        </div>
      );
    }

    if (!isIdle) {
      return (
        <div className="fix-version-copy">
          <span>Parsing {details.get('filename')}</span>
          <span>
            ...
            {status}
          </span>
        </div>
      );
    }

    return (
      <div className="fix-version-copy">
        <span>Use Your Own FIX</span>
        <span>Click or drop your FIX XML file here.</span>
      </div>
    );
  };

  return (
    <div className={listClass.join(' ')}>
      <Dropzone
        className="fix-version-upload-area"
        acceptClassName="fix-version-upload-accept"
        rejectClassName="fix-version-upload-reject"
        accept="text/xml"
        multiple={false}
        disabled={!isIdle}
        onDrop={uploadXml}
      >
        {dropzoneCopyFn}
      </Dropzone>
    </div>
  );
}

FixVersionUpload.propTypes = {
  details: PropTypes.object,
  uploadXml: PropTypes.func
};

export default FixVersionUpload;
