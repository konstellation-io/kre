import React, { useEffect, useState } from 'react';

import CodeBlock from './CodeBlock';
import MarkNav from 'markdown-navbar';
import ReactMarkdown from 'react-markdown';
import SpinnerCircular from 'Components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import styles from './Documentation.module.scss';
import { useLocation, useParams } from 'react-router-dom';
import { buildRoute } from 'Utils/routes';
import ROUTES, { VersionRouteParams } from 'Constants/routes';
import CustomLink from './CustomLink';
import { API_BASE_URL } from 'index';

function getHeader(tag: string) {
  return document.querySelectorAll(`[data-id="${tag}"]`)[0];
}

function scrollIntoHeader(headerHash: string): void {
  const headerTag = decodeURIComponent(headerHash).slice(1);
  const header = getHeader(headerTag);

  if (header) header.scrollIntoView();
}

function useDocFile(fileUrl?: string | null) {
  const [file, setFile] = useState<string>('');

  if (fileUrl) {
    fetch(fileUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(
            `Unexpected status code: ${response.status} getting documentation file`
          );
        }

        return response.text();
      })
      .then(text => setFile(text));
  }

  return file;
}

function Documentation() {
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();
  const params = useParams<VersionRouteParams>();

  const baseUrl = buildRoute.version(
    ROUTES.RUNTIME_VERSION_DOCUMENTATION,
    params.runtimeId,
    params.versionId
  );
  const docPath = location.pathname.replace(baseUrl, '');
  const apiDocUrl = `${API_BASE_URL}/static/version/${params.versionId}/docs/${docPath}`;
  const file = useDocFile(apiDocUrl);

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
          source={file}
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
        <ReactMarkdown
          source={file}
          renderers={{ code: CodeBlock, link: CustomLink }}
        />
      </div>
    </div>
  );
}

export default Documentation;
