import React from 'react';
import { useState, useEffect } from 'react';
// @ts-ignore
import Style from 'style-it';

type Props = {
  wrapper: any;
  target: any;
  render: any;
  expanded: boolean;
};
export default function useExpand({ wrapper, target, render, expanded }: any) {
  const [styles, setStyles] = useState('');

  useEffect(() => {
    if (target.current !== null && wrapper && wrapper.current !== null) {
      const t = target.current.getBoundingClientRect();
      let ns = `
        .component {
          width: ${t.width}px;
          height: ${t.height}px;
          top: ${t.top + 40}px;
        }
      `;

      setStyles(ns);
    }
  }, [target, wrapper]);

  useEffect(() => {
    if (expanded) {
      const w = wrapper.current.getBoundingClientRect();
      const t = target.current.getBoundingClientRect();
      const windowH = window.screen.height;
      setStyles(
        styles +
          `
        .component {
          width: ${w.width}px;
          height: calc(100% - ${w.top + 10}px);
          top: ${t.top - w.top - 40}px;
        }
      `
      );
    } else {
      if (target.current !== null) {
        const t = target.current.getBoundingClientRect();
        let ns = `
          .component {
            width: ${t.width}px;
            height: ${t.height}px;
            top: ${t.top + 40}px;
          }
        `;
        setStyles(ns);
      }
    }
  }, [expanded]);

  // @ts-ignore
  return Style.it(
    `.component {
      position: fixed;
      transition: all ease 0.6s;
      z-index: 1;
      box-shadow: 0 0 8px 24px #0d0e11;
    }
    ${styles}`,
    <div className={'component'}>{render}</div>
  );
}
