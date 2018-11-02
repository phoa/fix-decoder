import React from 'react';

import ReactIcon from './ReactIcon';

import './Footer.css';

function Footer(props) {
  return (
    <div className="footer-container">
      <p className="disclaimer">
        Google Analytics is setup to gain insights into usage of this web
        application. <br /> Apart from Google Analytics, all of your FIX related
        data(FIX message, or your custom FIX protocol) is processed locally, and
        stays in your browser. <br /> Your data is not sent or stored in any
        servers.
      </p>
      <p className="madeby">
        <a
          href="https://sg.linkedin.com/in/pnphoa"
          rel="noopener noreferrer"
          target="_blank"
          className="madeby-link link-to-linkedin"
        >
          Paul Nikolas Phoa
        </a>
        <span className="madeby-divider">&bull;</span>
        <a
          href="https://sg.linkedin.com/in/janaudy"
          rel="noopener noreferrer"
          target="_blank"
          className="madeby-link link-to-linkedin"
        >
          Thierry Janaudy
        </a>
      </p>
      <p className="madewith">
        <i className="material-icons"> code </i> with
        <ReactIcon width={24} height={24} />
      </p>
      <p className="deployby">
        <a
          href="https://www.netlify.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          <img
            alt="Deploys by Netlify"
            src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg"
          />
        </a>
      </p>
    </div>
  );
}

export default Footer;
