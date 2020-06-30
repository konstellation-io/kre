import Chart from 'chart.js';

export function lineChartWHoverLine(ease: string) {
  Chart.controllers.line.prototype.draw.call(this, ease);

  if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
    let activePoint = this.chart.tooltip._active[0],
      ctx = this.chart.ctx,
      x = activePoint.tooltipPosition().x,
      topY = 0,
      bottomY = this.chart.chartArea.bottom;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#61646A';
    ctx.stroke();
    ctx.restore();
  }
}
