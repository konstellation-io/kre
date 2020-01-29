import ReactDOMServer from 'react-dom/server';
import { select } from 'd3-selection';

export function wrap(text: any, width: number) {
  // @ts-ignore
  text.each(function() {
    // @ts-ignore
    let textNode = select(this),
      words = textNode
        .text()
        .split(/\s+/)
        .reverse(),
      word,
      line: any[] = [],
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
      line.push(word);
      tspan.text(line.join(' '));
      // @ts-ignore
      if (tspan.node().getComputedTextLength() > width) {
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

export function centerText(text: any, fontSize: number) {
  // @ts-ignore
  text.each(function() {
    // @ts-ignore
    const textNode = select(this);
    const textHeight = textNode.node().getBBox().height;

    const padding = fontSize - textHeight / 2;

    textNode.attr('transform', `translate(0, ${padding})`);
  });
}
export function getAxesMargins({
  xAxisG = null,
  yAxisG,
  padding = 0
}: any): [number, number] {
  // Recalculate margins with the new axis sizes
  let xAxisHeight = padding;
  let yAxisWidth = padding;

  if (xAxisG !== null) {
    xAxisG.selectAll('text').each(function() {
      // @ts-ignore
      const actHeight = this.getBoundingClientRect().height + padding;
      if (actHeight > xAxisHeight) xAxisHeight = actHeight;
    });
  }
  yAxisG.selectAll('text').each(function() {
    // @ts-ignore
    const actWidth = this.getBoundingClientRect().width + padding;
    if (actWidth > yAxisWidth) yAxisWidth = actWidth;
  });

  return [xAxisHeight, yAxisWidth];
}

export function rotateAxis(axisG: any, angle: number): void {
  axisG
    .selectAll('text')
    .style('text-anchor', 'end')
    .style('transform', `rotate(${angle}deg)`);
}

export const tooltipAction = {
  showTooltip: function({ svg, tooltip, content, dx, dy }: any) {
    const containerDims = svg.parentNode.getBoundingClientRect();
    const tooltipSelection = select(tooltip);

    const tooltipContent = tooltipSelection.select('.tooltipContent');
    // @ts-ignore
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
  hideTooltip: function(tooltip: any) {
    select(tooltip).style('opacity', 0);
  }
};

export function generateVerticalGradient(
  g: any,
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
