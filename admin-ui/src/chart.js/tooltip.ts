import { ChartTooltipModel, ChartTooltipModelBody } from 'chart.js';

export function createCustomTooltip(
  formatXAxis: Function,
  color: string,
  title: string
) {
  return function(tooltipModel: ChartTooltipModel) {
    const tooltipMargin = 8;
    const tooltipEl = document.getElementById('chartjs-tooltip');
    if (!tooltipEl) return;

    if (tooltipModel.opacity === 0) {
      tooltipEl.style.opacity = '0';
      return;
    }

    function getBody(bodyItem: ChartTooltipModelBody) {
      return bodyItem.lines;
    }

    if (tooltipModel.body) {
      const titleLines = tooltipModel.title || [];
      const bodyLines = tooltipModel.body.map(getBody);

      let innerHtml = '<thead>';

      titleLines.forEach(function(xValue: string) {
        innerHtml += '<tr><th>' + formatXAxis(xValue) + '</th></tr>';
      });
      innerHtml += '</thead><tbody>';

      bodyLines.forEach(function(body: string[]) {
        let style = `color:${color};font-weight:500;`;
        const titleText = `<span>${title}: </span>`;
        const bodyText = `<span style=${style}>${body}</span>`;
        innerHtml += '<tr><td>' + titleText + bodyText + '</td></tr>';
      });
      innerHtml += '</tbody>';

      const tableRoot = tooltipEl.querySelector('table');

      if (tableRoot) tableRoot.innerHTML = innerHtml;
    }

    const chartRect = this._chart.canvas.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();

    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;

    const chartX = chartRect.left + window.pageXOffset;
    const chartY = chartRect.top + window.pageYOffset;
    let tooltipX = chartX + tooltipModel.caretX - tooltipWidth / 2;
    let tooltipY = chartY + tooltipModel.caretY - tooltipHeight - tooltipMargin;

    if (tooltipX - tooltipWidth / 2 < chartX) {
      tooltipX += tooltipWidth / 2 + tooltipMargin;
    }
    if (tooltipX + tooltipWidth / 2 + tooltipWidth > chartX + chartRect.width) {
      tooltipX -= tooltipWidth / 2 + tooltipMargin;
    }
    if (tooltipY < chartY) {
      tooltipY += tooltipHeight + tooltipMargin;
    }

    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = `${tooltipX}px`;
    tooltipEl.style.top = `${tooltipY}px`;
    tooltipEl.style.padding =
      tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
  };
}
