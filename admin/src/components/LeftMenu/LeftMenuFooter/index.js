/**
 *
 * LeftMenuFooter
 *
 */

import React from 'react';
import { PropTypes } from 'prop-types';
import Wrapper, { A } from './Wrapper';

function LeftMenuFooter({ version }) {
  // PROJECT_TYPE is an env variable defined in the webpack config
  // eslint-disable-next-line no-undef
  const projectType = PROJECT_TYPE;

  return (
    <Wrapper>
      <div className="poweredBy">
        <A key="website" href="https://apipago.net/" target="_blank" rel="noopener noreferrer">
          Apipago
        </A>
        &nbsp;
        <A
          href={`https://apipago.net/`}
          key="github"
          target="_blank"
          rel="noopener noreferrer"
        >
          v{version}
        </A>
        &nbsp;
        <A href="https://apipago.net/" target="_blank" rel="noopener noreferrer">
          {/*— {projectType} Edition*/}
          Propiedad de Forward Solutions
        </A>
      </div>
    </Wrapper>
  );
}

LeftMenuFooter.propTypes = {
  version: PropTypes.string.isRequired,
};

export default LeftMenuFooter;
