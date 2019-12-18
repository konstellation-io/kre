import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router';

import HorizontalBar from '../../../../components/Layout/HorizontalBar/HorizontalBar';
import Button from '../../../../components/Button/Button';
import VersionStatusViewer from '../../../../components/VersionStatusViewer/VersionStatusViewer';
import Node, { TYPES, STATUS } from '../../../../components/Shape/Node/Node';

import { useMutation } from '@apollo/react-hooks';
import {
  ACTIVATE_VERSION,
  DEPLOY_VERSION,
  ActivateVersionResponse,
  DeployVersionResponse,
  ActivateDeployVersionVars
} from './RuntimeStatusPreview.graphql';

import styles from './RuntimeStatusPreview.module.scss';

const data = [
  {
    name: 'MAKE_PREDICTION',
    nodes: [
      {
        id: 'W1InputNode',
        name: 'TICKET ASSET',
        status: '',
        type: TYPES.INPUT
      },
      {
        id: 'W1InnerNode1',
        name: 'TICKET STATUS TRANSFORMER',
        status: '',
        type: TYPES.DEFAULT_2
      },
      {
        id: 'W1InnerNode2',
        name: 'TICKET STATUS NORMALIZATOR',
        status: '',
        type: TYPES.DEFAULT_2
      },
      {
        id: 'W1InnerNode3',
        name: 'TICKET CLASIFICATOR NN',
        status: '',
        type: TYPES.DEFAULT_2
      },
      {
        id: 'W1OutputNode',
        name: 'TNBA ORDERED',
        status: '',
        type: TYPES.OUTPUT
      }
    ],
    edges: [
      {
        id: 'Edge1',
        name: 'Edge1',
        status: '',
        value: 0,
        from: 'W1InputNode',
        to: 'W1InnerNode1'
      },
      {
        id: 'Edge2',
        name: 'Edge2',
        status: '',
        value: 0,
        from: 'W1InnerNode1',
        to: 'W1InnerNode2'
      },
      {
        id: 'Edge3',
        name: 'Edge3',
        status: '',
        value: 0,
        from: 'W1InnerNode2',
        to: 'W1InnerNode3'
      },
      {
        id: 'Edge4',
        name: 'Edge4',
        status: '',
        value: 0,
        from: 'W1InnerNode3',
        to: 'W1OutputNode'
      }
    ]
  },
  {
    name: 'SAVE_CLIENT_METRICS',
    nodes: [
      {
        id: 'W1InputNode',
        name: 'TICKET ASSET',
        status: '',
        type: TYPES.INPUT
      },
      {
        id: 'W1InnerNode1',
        name: 'TICKET STATUS TRANSFORMER',
        status: '',
        type: TYPES.DEFAULT_2
      },
      {
        id: 'W1InnerNode2',
        name: 'TICKET STATUS NORMALIZATOR',
        status: '',
        type: TYPES.DEFAULT_2
      },
      {
        id: 'W1OutputNode',
        name: 'TNBA ORDERED',
        status: '',
        type: TYPES.OUTPUT
      }
    ],
    edges: [
      {
        id: 'Edge1',
        name: 'Edge1',
        status: '',
        value: 0,
        from: 'W1InputNode',
        to: 'W1InnerNode1'
      },
      {
        id: 'Edge2',
        name: 'Edge2',
        status: '',
        value: 0,
        from: 'W1InnerNode1',
        to: 'W1InnerNode2'
      },
      {
        id: 'Edge3',
        name: 'Edge3',
        status: '',
        value: 0,
        from: 'W1InnerNode2',
        to: 'W1OutputNode'
      }
    ]
  }
];

function RuntimeStatusPreview() {
  // TODO: loading and error check
  const [activateMutation] = useMutation<
    ActivateVersionResponse,
    ActivateDeployVersionVars
  >(ACTIVATE_VERSION);
  const [deployMutation] = useMutation<
    DeployVersionResponse,
    ActivateDeployVersionVars
  >(DEPLOY_VERSION);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  });
  const container = useRef(null);
  const { versionId } = useParams();

  useEffect(() => {
    const containerDOM = container.current;

    setDimensions({
      // @ts-ignore
      width: containerDOM.clientWidth,
      // @ts-ignore
      height: containerDOM.clientHeight
    });
  }, [container]);

  function getMutationVars() {
    return {
      variables: {
        input: {
          versionId: versionId || ''
        }
      }
    };
  }
  function onDeployVersion() {
    deployMutation(getMutationVars());
  }
  function onActivateVersion() {
    activateMutation(getMutationVars());
  }

  const { width, height } = dimensions;

  return (
    <div ref={container} className={styles.container}>
      <HorizontalBar>
        <Button label="DEPLOY" onClick={onDeployVersion} />
        <Button label="ACTIVATE" onClick={onActivateVersion} />
      </HorizontalBar>
      STATUS PREVIEW
      <VersionStatusViewer
        width={width}
        height={height * 0.6}
        margin={{
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        }}
        data={data}
      />
      <Node type={TYPES.INPUT} status={STATUS.INACTIVE} />
      <Node type={TYPES.DEFAULT} status={STATUS.INACTIVE} />
      <Node type={TYPES.DEFAULT_2} status={STATUS.INACTIVE} />
      <Node type={TYPES.OUTPUT} status={STATUS.INACTIVE} />
    </div>
  );
}

export default RuntimeStatusPreview;
