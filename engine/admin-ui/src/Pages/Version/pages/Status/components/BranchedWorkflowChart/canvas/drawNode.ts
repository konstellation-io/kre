import styles from "../BranchedWorkflowChart.module.scss";
import { NodeStatus } from "Graphql/types/globalTypes";
import {isEntrypoint, NodeWithPosition, NodeWithStatus} from "../nodes/nodeUtils";
import { GetVersionWorkflows_version_workflows_nodes } from "Graphql/queries/types/GetVersionWorkflows";

type WorkflowData = {
  exitpoint: string | null;
}

type RectangleAtts = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}

function drawRectangle(ctx: CanvasRenderingContext2D, {x, y, w, h, r}: RectangleAtts) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function getStatusColor(status?: NodeStatus) {
  switch (status) {
    case NodeStatus.STARTED: {
      return styles.colorStatusStarted;
    }
    case NodeStatus.STOPPED: {
      return styles.colorStatusStopped;
    }
    case NodeStatus.STARTING: {
      return styles.colorStatusLoading;
    }
    case NodeStatus.ERROR: {
      return styles.colorStatusError;
    }
    default: {
      return styles.colorStatusStopped;
    }
  }
}

function drawEntrypointIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = styles.colorNodeBg;
  ctx.moveTo(x, y - 5)
  ctx.quadraticCurveTo(x + 4, y, x, y + 5)
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - 5)
  ctx.quadraticCurveTo(x - 4, y, x, y + 5)
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 4.5, y + 1.75)
  ctx.lineTo(x + 4.5, y + 1.75)
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 4.5, y - 1.75)
  ctx.lineTo(x + 4.5, y - 1.75)
  ctx.stroke();
}

function drawNodeBackground(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.fillStyle = styles.colorNodeBg;
  ctx.arc(x, y, 10, 0, 2 * Math.PI);
  ctx.fill();
}

function drawInnerNodeBase(ctx: CanvasRenderingContext2D, x: number, y: number, statusColor: string) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
  ctx.fillStyle = statusColor;
  ctx.fill();
}

function drawExitpointIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.strokeStyle = styles.colorNodeBg;
  ctx.moveTo(x - 2.5, y);
  ctx.lineTo(x + 1.3, y);
  ctx.moveTo(x, y + 1.5);
  ctx.lineTo(x + 1.5, y - 0.2);
  ctx.moveTo(x, y - 1.5);
  ctx.lineTo(x + 1.5, y + 0.2);
  ctx.moveTo(x + 2.3, y - 1.7);
  ctx.lineTo(x + 2.3, y + 1.7);
  ctx.stroke();
}

function drawInnerCircleNode(
  ctx: CanvasRenderingContext2D,
  node: NodeWithPosition,
  x: number,
  y: number,
  statusColor: string,
  exitpoint: string,
  ) {
  drawInnerNodeBase(ctx, x, y, statusColor);
  if (isEntrypoint(node)) {
    drawEntrypointIcon(ctx, x, y);
  }
  const isExitpoint = exitpoint === node.name;
  if (isExitpoint) {
    drawExitpointIcon(ctx, x, y);
  }
}

function drawNodeOutline(ctx: CanvasRenderingContext2D, statusColor: string, x: number, y: number) {
  ctx.beginPath();
  ctx.lineWidth = 0.6;
  ctx.strokeStyle = statusColor;
  ctx.arc(x, y, 10, 0, 2 * Math.PI);
  ctx.stroke();
}

function drawNameLabel(ctx: CanvasRenderingContext2D, nodeName: string, x: number, y: number) {
  ctx.beginPath();
  ctx.lineWidth = 0.6
  const rectangleLength = nodeName.length * 2.2 + 10
  const rectanglePosition = x - rectangleLength / 2
  ctx.strokeStyle = styles.colorTextLabel;
  ctx.fillStyle = styles.colorLabelBg;
  drawRectangle(ctx, {x: rectanglePosition, y: y - 22, w: rectangleLength, h: 9, r: 2})
  ctx.fill()
  ctx.stroke()

  // Write node name label
  ctx.beginPath();
  ctx.font = '4pt Calibri';
  ctx.fillStyle = styles.colorTextLabel;
  ctx.textAlign = "center";
  ctx.fillText(nodeName, x, y - 16);
}

export function drawNode(
  node: NodeWithPosition,
  ctx: CanvasRenderingContext2D,
  workflowData: WorkflowData
) {
  const { name, x, y, status } = node;
  const statusColor = getStatusColor(status);

  console.log(workflowData);

  drawNodeBackground(ctx, x, y);
  drawInnerCircleNode(ctx, node, x, y, statusColor, workflowData.exitpoint ?? 'exitpoint');
  drawNodeOutline(ctx, statusColor, x, y);
  drawNameLabel(ctx, name, x, y);
  drawNodeCountBadge(ctx, node, x, y, statusColor, workflowData.exitpoint ?? 'exitpoint');
}
function drawNodeCountBadge(ctx: CanvasRenderingContext2D, node: NodeWithPosition, x: number, y: number, statusColor: string, exitpoint: string) {
  const isExitpoint = exitpoint === node.name;

  if (isEntrypoint(node) || isExitpoint) {
    return;
  }

  const rectangleLength = node.name.length * 2.2 + 10
  const rectanglePosition = x - rectangleLength / 2

  ctx.beginPath();
  //ctx.arc(x - rectanglePosition , y - 18, 3, 0, 2 * Math.PI, false);
  ctx.arc(x + 2 * Math.PI, y - 2 * Math.PI, 3, 0, 2 * Math.PI, false);
  //ctx.fillStyle = "#64b5f6";// statusColor;
  ctx.fill();

  ctx.beginPath();
  ctx.lineWidth = 0.4;
  ctx.strokeStyle = "white";
  //ctx.arc(x - rectanglePosition, y - 18, 3, 0, 2 * Math.PI, false);
  ctx.arc(x + 2 * Math.PI, y - 2 * Math.PI, 3, 0, 2 * Math.PI, false);
  ctx.stroke();

  ctx.beginPath();
  ctx.font = '4pt Calibri';
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  //ctx.fillText(node.replicas.toString(), x - rectanglePosition, y - 16);
  ctx.fillText(node.replicas.toString(), x + 2 * Math.PI, y - 2 * Math.PI + 1.5);
}
