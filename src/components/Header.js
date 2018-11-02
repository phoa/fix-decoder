import React from 'react';

import GithubRibbon from './GithubRibbon';

import './Header.css';

function Header(props) {
  return (
    <div className="app-header">
      <GithubRibbon githubLink="https://github.com/phoa/fix-decoder" />
      <div className="app-header-title">
        <h2>FIX Decoder</h2>
      </div>
    </div>
  );
}

export default Header;
