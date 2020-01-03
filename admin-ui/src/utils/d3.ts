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
