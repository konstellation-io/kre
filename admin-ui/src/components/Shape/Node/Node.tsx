import React from 'react';
import { ReactComponent as InputNodeSVG } from './InputNode.svg';
import { ReactComponent as DefaultNodeSVG } from './DefaultNode.svg';
import { ReactComponent as DefaultNode2SVG } from './DefaultNode2.svg';
import { ReactComponent as OutputNodeSVG } from './OutputNode.svg';

import './Node.scss';

export const TYPES = {
  INPUT: 'INPUT',
  DEFAULT: 'DEFAULT',
  DEFAULT_2: 'DEFAULT_2',
  OUTPUT: 'OUTPUT'
};

export const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
};

type Props = {
  type: string;
  status: string;
  width?: number;
  height?: number | string;
};
function Node({ type, status, width = 218, height = 66 }: Props) {
  let NodePath;

  switch (type) {
    case TYPES.INPUT:
      NodePath = InputNodeSVG;
      break;
    case TYPES.DEFAULT:
      NodePath = DefaultNodeSVG;
      break;
    case TYPES.DEFAULT_2:
      NodePath = DefaultNode2SVG;
      break;
    case TYPES.OUTPUT:
      NodePath = OutputNodeSVG;
      break;

    default:
      NodePath = InputNodeSVG;
  }

  return (
    <svg width={width} height={height} className={status} viewBox="0 0 218 66">
      <path
        d="M 0 0
          H 218
          V 66
          H 0"
        fill="none"
      />
      <svg className="nodeContainer">
        <NodePath />
      </svg>
      {/* <path
        d="M 0 33
          H 218"
        fill="none"
        stroke="red"
      /> */}
      {/* <path
        d="M 150 20
          H 187
          A 1 1, 0, 1, 1, 187 61
          H 46
          A 1 1, 0, 1, 1, 35 5
          Z"
        fill="none"
        stroke="red"
      /> */}
    </svg>
  );
}

export default Node;
