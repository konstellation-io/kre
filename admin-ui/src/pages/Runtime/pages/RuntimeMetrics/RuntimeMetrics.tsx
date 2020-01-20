import React, { useState } from 'react';

import { Col, ColsWrapper, Row, RowsWrapper } from 'react-grid-resizable';
import DashboardTitle from './components/DashboardTitle/DashboardTitle';
import Box from './components/Box/Box';

import GeneralInfo from './boxes/GeneralInfo/GeneralInfo';
import Accuracy from './boxes/Accuracy/Accuracy';

import cx from 'classnames';
import styles from './RuntimeMetrics.module.scss';

function RuntimeMetrics() {
  const separatorColProps = { className: styles.separatorCol };
  const separatorRowProps = { className: styles.separatorRow };

  const [expanded, setExpanded] = useState<string>('');

  function toggleExpanded(nodeId: string): void {
    if (expanded) {
      setExpanded('');
    } else {
      setExpanded(nodeId);
    }
  }

  function getNodesToExpand() {
    const nodes = [expanded];
    let act = expanded;

    while (act.length > 0) {
      act = act.slice(0, -2);
      nodes.push(act);
    }

    return nodes;
  }

  const minimize = {
    [styles.minimize]: expanded
  };

  const nodesToExpand = getNodesToExpand();

  const height = expanded ? window.innerHeight - 164 : '100%';
  const width = window.innerWidth - 310;

  return (
    <div className={styles.container}>
      <DashboardTitle runtimeName={'Runtime X'} versionName={' V1.0.2'} />
      <div className={styles.content}>
        <div
          className={cx(styles.wrapper, {
            [styles.expanded]: expanded
          })}
          style={{ height }}
        >
          <RowsWrapper separatorProps={separatorRowProps}>
            <Row
              initialHeight={165}
              style={{
                maxHeight: '165px'
              }}
              className={cx(styles.row, minimize, {
                [styles.maximize]: nodesToExpand.includes('r1')
              })}
              disabled
            >
              <GeneralInfo />
            </Row>
            <Row
              initialHeight={590}
              style={{
                maxHeight: '590px',
                marginTop: '10px'
              }}
              className={cx(styles.row, minimize, {
                [styles.maximize]: nodesToExpand.includes('r2')
              })}
              top={false}
            >
              <ColsWrapper separatorProps={separatorColProps}>
                <Col
                  initialWidth={width * 0.25}
                  className={cx(styles.col, minimize, {
                    [styles.maximize]: nodesToExpand.includes('r2c1')
                  })}
                  style={{ maxWidth: 'calc(100% - 160px)' }}
                >
                  <RowsWrapper separatorProps={separatorRowProps}>
                    <Row
                      className={cx(styles.row, minimize, {
                        [styles.maximize]: nodesToExpand.includes('r2c1r1')
                      })}
                      style={{ maxHeight: 590 - 160 }}
                    >
                      <Accuracy
                        toggleExpanded={toggleExpanded}
                        nodeId={'r2c1r1'}
                      />
                    </Row>
                    <Row
                      className={cx(styles.row, minimize, {
                        [styles.maximize]: nodesToExpand.includes('r2c1r2')
                      })}
                    >
                      <Accuracy
                        toggleExpanded={toggleExpanded}
                        nodeId={'r2c1r2'}
                      />
                    </Row>
                  </RowsWrapper>
                </Col>
                <Col
                  className={cx(styles.col, minimize, {
                    [styles.maximize]: nodesToExpand.includes('r2c2')
                  })}
                  style={{ maxWidth: 'calc(100% - 160px)' }}
                >
                  <Box />
                </Col>
              </ColsWrapper>
            </Row>
            <Row
              initialHeight={277}
              className={cx(styles.row, minimize, {
                [styles.maximize]: nodesToExpand.includes('r3')
              })}
              style={{ maxHeight: 277 + 590 - 160 }}
            >
              <ColsWrapper separatorProps={separatorColProps}>
                <Col
                  className={cx(styles.col, minimize, {
                    [styles.maximize]: nodesToExpand.includes('r3c1')
                  })}
                >
                  <Accuracy toggleExpanded={toggleExpanded} nodeId={'r3c1'} />
                </Col>
                <Col
                  className={cx(styles.col, minimize, {
                    [styles.maximize]: nodesToExpand.includes('r3c2')
                  })}
                >
                  <Accuracy
                    withBgBars={true}
                    toggleExpanded={toggleExpanded}
                    nodeId={'r3c2'}
                  />
                </Col>
              </ColsWrapper>
            </Row>
          </RowsWrapper>
        </div>
      </div>
    </div>
  );
}

export default RuntimeMetrics;
