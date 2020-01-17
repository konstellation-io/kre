import React, { FunctionComponent, useRef, useState, useEffect } from 'react';
import cx from 'classnames';
import styles from './Box.module.scss';

type Props = {
  children?: any;
  expanded?: boolean;
  dashboardContainer?: any;
};
const Box: FunctionComponent<Props> = ({
  children,
  expanded,
  dashboardContainer
}) => {
  const container = useRef(null);
  const [containerBox, setContainerBox] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  });

  useEffect(() => {
    // @ts-ignore
    setContainerBox(container.current.getBoundingClientRect());
  }, [container, setContainerBox]);

  let initialBoxStyle = {};
  let finalBoxStyle = {};

  initialBoxStyle = {};

  if (dashboardContainer && dashboardContainer.current !== null) {
    const dashboardBox = dashboardContainer.current.getBoundingClientRect();
    initialBoxStyle = {};

    if (expanded) {
      finalBoxStyle = {
        width: dashboardBox.width,
        height: dashboardBox.height,
        marginTop: -(containerBox.top - dashboardBox.top) - 40
      };
    }
  }

  return (
    <div
      className={cx(styles.container, {
        [styles.expandedInitial]: expanded,
        [styles.expanded]: expanded
      })}
      style={{ ...initialBoxStyle, ...finalBoxStyle }}
      ref={container}
    >
      {children}
    </div>
  );
};

export default Box;
