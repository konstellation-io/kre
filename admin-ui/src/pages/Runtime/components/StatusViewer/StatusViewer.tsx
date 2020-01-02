import { cloneDeep } from 'lodash';

import React, { useRef, useState, useEffect } from 'react';
import { TYPES } from '../../../../components/Shape/Node/Node';

import VersionStatusViewer from '../../../../components/VersionStatusViewer/VersionStatusViewer';

import styles from './StatusViewer.module.scss';

function formatData(workflows: any, status: string) {
  let formattedData = cloneDeep(workflows);

  formattedData = formattedData.map((workflow: any, idx: number) => {
    workflow.nodes = workflow.nodes.map((node: any) => {
      node.status = status;
      return node;
    });
    workflow.edges = workflow.edges.map((edge: any) => {
      edge.status = status;
      return edge;
    });
    workflow.nodes.unshift({
      id: `W${idx}InputNode`,
      name: 'DATA INPUT',
      status: status,
      type: TYPES.INPUT
    });
    workflow.nodes.push({
      id: `W${idx}OutputNode`,
      name: 'DATA OUTPUT',
      status: status,
      type: TYPES.OUTPUT
    });
    workflow.edges.push({
      id: 'InputEdge',
      status: status,
      fromNode: `W${idx}InputNode`,
      toNode: workflow.nodes[1].id
    });
    workflow.edges.push({
      id: 'OutputEdge',
      status: status,
      fromNode: workflow.nodes[workflow.nodes.length - 2].id,
      toNode: `W${idx}OutputNode`
    });

    return workflow;
  });

  return formattedData;
}

function StatusViewer({ data, status }: any) {
  const container = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const containerDOM = container.current;

    if (containerDOM) {
      setDimensions({
        // @ts-ignore
        width: containerDOM.clientWidth,
        // @ts-ignore
        height: containerDOM.clientHeight
      });
    }
  }, [container]);

  const { width, height } = dimensions;

  return (
    <div ref={container} className={styles.container}>
      <VersionStatusViewer
        width={width}
        height={height}
        margin={{
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        }}
        data={formatData(data, status)}
        preview={['CREATED', 'STOPPED'].includes(status)}
      />
    </div>
  );
}

export default StatusViewer;
