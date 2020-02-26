import ReactDOMServer from 'react-dom/server';
import { select, Selection } from 'd3-selection';
import { ReactElement } from 'react';

export function wrap(
  text: Selection<SVGTextElement, unknown, null, undefined>,
  width: number
) {
  text.each(function() {
    let textNode = select(this),
      words = textNode
        .text()
        .split(/\s+/)
        .reverse(),
      word,
      line: string[] = [],
      lineNumber = 0,
      lineHeight = 1.3, // ems
      y = textNode.attr('y'),
      x = textNode.attr('x'),
      dy = parseFloat(textNode.attr('dy')),
      tspan = textNode
        .text(null)
        .append('tspan')
        .attr('x', x)
        .attr('y', y)
        .attr('dy', dy + 'em');
    while ((word = words.pop())) {
      const tspanNode = tspan.node();
      line.push(word);
      tspan.text(line.join(' '));

      if (tspanNode !== null && tspanNode.getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = textNode
          .append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word);
      }
    }
  });
}

export function centerText(
  text: Selection<SVGTextElement, unknown, null, undefined>,
  fontSize: number
) {
  text.each(function() {
    const textNode = select(this);
    const textDOMNode = textNode.node();

    if (textDOMNode !== null) {
      const textHeight = textDOMNode.getBBox().height;

      const padding = fontSize - textHeight / 2;

      textNode.attr('transform', `translate(0, ${padding})`);
    }
  });
}

type GetAxesMarginsParams = {
  xAxisG?: Selection<SVGGElement, unknown, null, undefined> | null;
  yAxisG?: Selection<SVGGElement, unknown, null, undefined> | null;
  padding?: number;
};
export function getAxesMargins({
  xAxisG = null,
  yAxisG = null,
  padding = 0
}: GetAxesMarginsParams): [number, number] {
  // Recalculate margins with the new axis sizes
  let xAxisHeight = padding;
  let yAxisWidth = padding;

  if (xAxisG !== null) {
    xAxisG.selectAll<SVGTextElement, string>('text').each(function() {
      const actHeight = this.getBoundingClientRect().height + padding;
      if (actHeight > xAxisHeight) xAxisHeight = actHeight;
    });
  }
  if (yAxisG !== null) {
    yAxisG.selectAll<SVGTextElement, string>('text').each(function() {
      const actWidth = this.getBoundingClientRect().width + padding;
      if (actWidth > yAxisWidth) yAxisWidth = actWidth;
    });
  }

  return [xAxisHeight, yAxisWidth];
}

export function rotateAxis(
  axisG: Selection<SVGGElement, unknown, null, undefined>,
  angle: number
): void {
  axisG
    .selectAll('text')
    .style('text-anchor', 'end')
    .style('transform', `rotate(${angle}deg)`);
}

type ShowTooltipParams = {
  svg: SVGElement | null;
  tooltip: HTMLDivElement | null;
  content: ReactElement;
  dx: number;
  dy: number;
};
export const tooltipAction = {
  showTooltip: function({ svg, tooltip, content, dx, dy }: ShowTooltipParams) {
    if (svg === null || tooltip === null || svg.parentNode === null) {
      return;
    }

    const svgParent = svg.parentNode as HTMLDivElement;

    const containerDims = svgParent.getBoundingClientRect();
    const tooltipSelection = select(tooltip);

    const tooltipContent = tooltipSelection.select('.tooltipContent');
    tooltipContent.html(ReactDOMServer.renderToString(content));

    const wrapper = tooltip.getBoundingClientRect();
    const [tooltipWidth, tooltipHeight] = [wrapper.width, wrapper.height];
    let tooltipLeft = dx - tooltipWidth / 2;
    let tooltipTop = dy - tooltipHeight - 10;

    const rightOverflow = dx + tooltipWidth / 2 > containerDims.width;
    tooltipSelection.classed('left', rightOverflow);
    if (rightOverflow) {
      tooltipLeft = dx - tooltipWidth - 15;
      tooltipTop = dy - tooltipHeight / 2;
    }

    const topOverflow = tooltipTop < 0;
    tooltipSelection.classed('down', topOverflow);
    if (topOverflow) {
      tooltipTop = dy + 10;
    }

    tooltipSelection
      .style('left', tooltipLeft + 'px')
      .style('top', tooltipTop + 'px')
      .style('opacity', 1);
  },
  hideTooltip: function(tooltip: HTMLDivElement | null) {
    if (tooltip !== null) {
      select(tooltip).style('opacity', 0);
    }
  }
};

export function generateVerticalGradient(
  g: Selection<SVGGElement, unknown, null, undefined>,
  colors: [string, string, string, string]
): void {
  const [color10, color30, color60, color90] = colors;
  const gradient = g
    .append('defs')
    .append('svg:linearGradient')
    .attr('id', 'verticalGradient')
    .attr('x1', '100%')
    .attr('y1', '100%')
    .attr('x2', '100%')
    .attr('y2', '0%')
    .attr('spreadMethod', 'pad');

  gradient
    .append('stop')
    .attr('offset', '10%')
    .attr('stop-color', color10)
    .attr('stop-opacity', 1);

  gradient
    .append('stop')
    .attr('offset', '30%')
    .attr('stop-color', color30)
    .attr('stop-opacity', 1);

  gradient
    .append('stop')
    .attr('offset', '60%')
    .attr('stop-color', color60)
    .attr('stop-opacity', 1);

  gradient
    .append('stop')
    .attr('offset', '90%')
    .attr('stop-color', color90)
    .attr('stop-opacity', 1);
}

export function getClassFromLabel(label: string) {
  return `node_${label.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

export function getArrowD(nodeSizeRatio: number, sizePerc: number): string {
  const dx = nodeSizeRatio * sizePerc * 7;
  const dy = nodeSizeRatio * sizePerc * 3;

  return `M 0 0 m -${dx} -${dy} l +${dx} +${dy} l -${dx} ${dy}`;
}
