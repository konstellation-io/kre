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
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  WARNING: 'warning',
  ERROR: 'error'
};

type Props = {
  type: string;
  status: string;
  width?: number;
  height?: number;
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
      <NodePath />
    </svg>
  );
}

export default Node;
