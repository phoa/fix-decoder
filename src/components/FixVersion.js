/**
 * Taken from
 * https://github.com/tholman/github-corners
 */

import React from 'react';
import PropTypes from 'prop-types';
import posed, { PoseGroup } from 'react-pose';
import styled from 'styled-components';

import FixVersionItem from './FixVersionItem';

import './FixVersion.css';

const FixVersionListItem = styled(
  posed.li({
    enter: {
      background: '#fff',
      color: '#222',
      transition: { duration: 1000, ease: 'easeOut' }
    },
    exit: { background: '#222', color: '#fff' }
  })
)`
  margin: 0.5em 1em;
  list-style: none;
`;

function FixVersion(props) {
  const { fixVersionList, activeFixVersion, loadAndParseFixXml } = props;
  const fixVersionItems = fixVersionList.map(v => {
    const version = v.version;
    const key = `fix-version-${version}`;
    return (
      <FixVersionListItem className="fix-version-list-item-wrapper" key={key}>
        <FixVersionItem
          isSelected={version === activeFixVersion}
          details={v}
          loadAndParseFixXml={loadAndParseFixXml}
        />
      </FixVersionListItem>
    );
  });

  return (
    <div className={'fix-version'}>
      <span className={'fix-version-title'}>FIX Protocol</span>
      <ul className={'fix-version-list'}>
        <PoseGroup>{fixVersionItems}</PoseGroup>
      </ul>
    </div>
  );
}

FixVersion.propTypes = {
  activeFixVersion: PropTypes.string,
  fixVersionList: PropTypes.array,
  loadAndParseFixXml: PropTypes.func
};

export default FixVersion;
