import Chart from 'chart.js';
import { lineChartWHoverLine } from './lineChartWHoverLine';

Chart.defaults.global.defaultFontFamily = "'Montserrat', sans-serif";
Chart.defaults.global.responsive = true;
Chart.defaults.global.maintainAspectRatio = false;
Chart.defaults.timeLine = Chart.defaults.line;
Chart.controllers.timeLine = Chart.controllers.line.extend({
  draw: lineChartWHoverLine
});

Chart.defaults.global.tooltips.enabled = false;
Chart.defaults.global.tooltips.intersect = false;
Chart.defaults.global.tooltips.xPadding = 6;
Chart.defaults.global.tooltips.yPadding = 6;
Chart.defaults.global.tooltips.caretPadding = 8;

if (Chart.defaults.global?.layout?.padding)
  Chart.defaults.global.layout.padding = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };

if (Chart.defaults.global?.legend?.display)
  Chart.defaults.global.legend.display = false;
