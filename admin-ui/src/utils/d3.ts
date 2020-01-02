import { select } from 'd3-selection';

export function wrap(text: any, width: number) {
  // @ts-ignore
  text.each(function() {
    // @ts-ignore
    let text = select(this),
      words = text
        .text()
        .split(/\s+/)
        .reverse(),
      word,
      line: any[] = [],
      lineNumber = 0,
      lineHeight = 1.3, // ems
      y = text.attr('y'),
      x = text.attr('x'),
      dy = parseFloat(text.attr('dy')),
      tspan = text
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
        tspan = text
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
    const text = select(this);
    const textNode = text.node();

    const textHeight = textNode.getBBox().height;

    const padding = fontSize - textHeight / 2;

    text.attr('transform', `translate(0, ${padding})`);
  });
}
