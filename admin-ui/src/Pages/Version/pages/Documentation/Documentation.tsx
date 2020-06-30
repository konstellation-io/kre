import React, { useEffect, useState } from 'react';

import CodeBlock from './CodeBlock';
import MarkNav from 'markdown-navbar';
import ReactMarkdown from 'react-markdown';
import SpinnerCircular from 'Components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import article from './article';
import styles from './Documentation.module.scss';
import { useLocation } from 'react-router-dom';

function getHeader(tag: string) {
  return document.querySelectorAll(`[data-id="${tag}"]`)[0];
}

function scrollIntoHeader(headerHash: string): void {
  const headerTag = decodeURIComponent(headerHash).slice(1);
  const header = getHeader(headerTag);

  if (header) header.scrollIntoView();
}

function Documentation() {
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    setTimeout(() => {
      scrollIntoHeader(location.hash);
      setLoading(false);
    }, 500);
    // We want to set this timeout only after rendering the component.
    // location.hash changes are handled in the next useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollIntoHeader(location.hash);
  }, [location]);

  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.loadingContainer}>
          <SpinnerCircular />
        </div>
      )}
      <div className={styles.navigation}>
        <MarkNav
          declarative
          source={article}
          ordered={false}
          onNavItemClick={(
            event: Event,
            element: HTMLDivElement,
            headerTag: string
          ) => {
            getHeader(headerTag).scrollIntoView();
          }}
        />
      </div>
      <div className={styles.article}>
        <ReactMarkdown source={article} renderers={{ code: CodeBlock }} />
      </div>
    </div>
  );
}

export default Documentation;
