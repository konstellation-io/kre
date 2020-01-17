import React, { useRef } from 'react';

import { Col, ColsWrapper, Row, RowsWrapper } from 'react-grid-resizable';
import DashboardTitle from './components/DashboardTitle/DashboardTitle';
import Box from './components/Box/Box';

import GeneralInfo from './boxes/GeneralInfo/GeneralInfo';
import Accuracy from './boxes/Accuracy/Accuracy';

import styles from './RuntimeMetrics.module.scss';

function RuntimeMetrics() {
  const container = useRef(null);
  const separatorColProps = { className: styles.separatorCol };
  const separatorRowProps = { className: styles.separatorRow };
  return (
    <div className={styles.container}>
      <DashboardTitle runtimeName={'Runtime X'} versionName={' V1.0.2'} />
      <div className={styles.content}>
        <div className={styles.wrapper} ref={container}>
          <RowsWrapper separatorProps={separatorRowProps}>
            <Row initialHeight={165} className={styles.row} disabled>
              <GeneralInfo />
            </Row>
            <Row
              initialHeight={590}
              className={styles.row}
              top={false}
              style={{ marginTop: 10 }}
            >
              <ColsWrapper separatorProps={separatorColProps}>
                <Col
                  className={styles.col}
                  style={{ maxWidth: 'calc(100% - 160px)' }}
                >
                  <RowsWrapper separatorProps={separatorRowProps}>
                    <Row
                      className={styles.row}
                      style={{ maxHeight: 590 - 160 }}
                    >
                      <Accuracy wrapper={container} />
                    </Row>
                    <Row className={styles.row}>
                      <Accuracy />
                    </Row>
                  </RowsWrapper>
                </Col>
                <Col className={styles.col}>
                  <Box />
                </Col>
              </ColsWrapper>
            </Row>
            <Row
              initialHeight={277}
              className={styles.row}
              style={{ maxHeight: 277 + 590 - 160 }}
            >
              <ColsWrapper separatorProps={separatorColProps}>
                <Col className={styles.col}>
                  <Accuracy />
                </Col>
                <Col className={styles.col}>
                  <Accuracy withBgBars={true} />
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
