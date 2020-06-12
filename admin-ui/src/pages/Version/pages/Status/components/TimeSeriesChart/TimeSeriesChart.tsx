import React, { useRef, useEffect, MouseEvent } from 'react';
import { color as c } from 'd3-color';
import IconExpand from '@material-ui/icons/KeyboardArrowDown';
import IconShrink from '@material-ui/icons/KeyboardArrowUp';
import Chart from 'chart.js';
import styles from './TimeSeriesChart.module.scss';
import cx from 'classnames';

Chart.defaults.global.defaultFontFamily = "'Montserrat', sans-serif";
// @ts-ignore
Chart.defaults.global.legend.display = false;
Chart.defaults.timeLine = Chart.defaults.line;
Chart.controllers.timeLine = Chart.controllers.line.extend({
  draw: function(ease: string) {
    Chart.controllers.line.prototype.draw.call(this, ease);

    if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
      var activePoint = this.chart.tooltip._active[0],
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
});

function getRGB(color: string) {
  return c(color)?.rgb() ?? { r: 0, g: 0, b: 0 };
}

export type D = {
  x: Date;
  y: number | null;
};

type Props = {
  data: D[];
  unit: string;
  title: string;
  expanded: boolean;
  toggleExpand: (event: MouseEvent<HTMLDivElement>) => void;
  nMaxElements: number;
  formatXAxis?: (value: string) => string;
  formatYAxis?: (value: number) => string;
  highlightLastValue?: boolean;
  color?: string;
};
function TimeSeriesChart({
  data,
  unit,
  title,
  expanded,
  toggleExpand,
  nMaxElements,
  highlightLastValue,
  color = '#f00',
  formatXAxis = v => v,
  formatYAxis = v => v.toString()
}: Props) {
  const chart = useRef<Chart>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { r, g, b } = getRGB(color);
  const colorStyle = useRef({ color });
  const bgColorStyle = useRef({ backgroundColor: color });
  const ExpandIcon = expanded ? IconShrink : IconExpand;

  const formatYWUnit = (v: number) => `${formatYAxis(v)}${unit}`;

  useEffect(() => {
    if (chartRef.current !== null) {
      // @ts-ignore
      chart.current = new Chart(chartRef.current.getContext('2d'), {
        type: 'timeLine',
        data: {
          labels: data.map(d => d.x),
          datasets: [
            {
              label: title,
              lineTension: 0.2,
              pointHitRadius: 20,
              pointBackgroundColor: color,
              pointRadius: 0,
              data: data.map(d => d.y),
              backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
              borderColor: color,
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }
          },
          tooltips: {
            enabled: false,
            intersect: false,
            xPadding: 6,
            yPadding: 6,
            yAlign: true,
            caretPadding: 8,
            callbacks: {
              label: (d: any) => formatYWUnit(d.value)
            },
            custom: function(tooltipModel: any) {
              const tooltipMargin = 8;
              const tooltipEl = document.getElementById('chartjs-tooltip');
              if (!tooltipEl) return;

              if (tooltipModel.opacity === 0) {
                tooltipEl.style.opacity = '0';
                return;
              }

              function getBody(bodyItem: any) {
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

                bodyLines.forEach(function(body: any, i: any) {
                  let style = `color:${color};font-weight:500;`;
                  const titleText = `<span>${title}: </span>`;
                  const bodyText = `<span style=${style}>${body}</span>`;
                  innerHtml += '<tr><td>' + titleText + bodyText + '</td></tr>';
                });
                innerHtml += '</tbody>';

                const tableRoot = tooltipEl.querySelector('table');
                // @ts-ignore
                tableRoot.innerHTML = innerHtml;
              }

              const chartRect = this._chart.canvas.getBoundingClientRect();
              const tooltipRect = tooltipEl.getBoundingClientRect();

              const tooltipWidth = tooltipRect.width;
              const tooltipHeight = tooltipRect.height;

              const chartX = chartRect.left + window.pageXOffset;
              const chartY = chartRect.top + window.pageYOffset;
              let tooltipX = chartX + tooltipModel.caretX - tooltipWidth / 2;
              let tooltipY =
                chartY + tooltipModel.caretY - tooltipHeight - tooltipMargin;

              if (tooltipX - tooltipWidth / 2 < chartX) {
                tooltipX += tooltipWidth / 2 + tooltipMargin;
              }
              if (
                tooltipX + tooltipWidth / 2 + tooltipWidth >
                chartX + chartRect.width
              ) {
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
            }
          },
          scales: {
            xAxes: [
              {
                type: 'time',
                time: {
                  unit: 'second'
                },
                display: false,
                ticks: { display: false },
                gridLines: {
                  display: false,
                  drawBorder: false
                },
                bounds: 'ticks'
              }
            ],
            yAxes: [
              {
                display: false,
                ticks: { display: false, beginAtZero: true },
                gridLines: {
                  display: false,
                  drawBorder: false
                }
              }
            ]
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    if (chart.current !== null) {
      if (chart.current.options.scales?.yAxes) {
        chart.current.options.scales.yAxes = [
          {
            display: expanded,
            ticks: {
              display: true,
              mirror: true,
              maxTicksLimit: 6,
              fontStyle: 'bold',
              padding: -8,
              beginAtZero: true,
              callback: formatYWUnit
            },
            afterTickToLabelConversion: function(scaleInstance: any) {
              scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;
              scaleInstance.ticksAsNumbers[
                scaleInstance.ticksAsNumbers.length - 1
              ] = null;
            },
            gridLines: {
              display: true,
              color: '#000',
              drawTicks: false,
              z: -100,
              drawBorder: false
            }
          }
        ];
      }

      chart.current.update();
    }
  }, [expanded]);

  useEffect(() => {
    if (data && chart.current) {
      chart.current.data.labels = data.map(d => d.x);
      if (chart.current.data.datasets) {
        chart.current.data.datasets[0].data = data.map(d => d.y);
      }

      // @ts-ignore
      if (chart.current.options.scales.yAxes) {
        // @ts-ignore
        chart.current.options.scales.yAxes = [
          {
            display: expanded,
            ticks: {
              display: true,
              mirror: true,
              maxTicksLimit: 6,
              fontStyle: 'bold',
              padding: -8,
              beginAtZero: true,
              callback: formatYWUnit
            },
            afterTickToLabelConversion: function(scaleInstance: any) {
              scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;
              scaleInstance.ticksAsNumbers[
                scaleInstance.ticksAsNumbers.length - 1
              ] = null;
            },
            gridLines: {
              display: true,
              color: '#000',
              drawTicks: false,
              z: -100,
              drawBorder: false
            }
          }
        ];
      }

      // @ts-ignore
      if (chart.current.options.scales.xAxes) {
        // @ts-ignore
        chart.current.options.scales.xAxes = [
          {
            // @ts-ignore
            ...chart.current.options.scales.xAxes[0],
            ticks: {
              display: false,
              min: data[
                Math.max(0, data.length - nMaxElements)
              ].x.toISOString(),
              max: data[data.length - 1].x.toISOString()
            }
          }
        ];
      }

      chart.current.update({
        duration: 300,
        easing: 'linear'
      });
    }
  }, [data]);

  return (
    <div className={cx(styles.container, { [styles.expanded]: expanded })}>
      <div className={styles.topPannel}>
        {highlightLastValue && (
          <div className={styles.lastValue} style={colorStyle.current}>
            {formatYWUnit(data.slice(-1)[0].y || 0)}
          </div>
        )}
        <div className={styles.legend}>
          <div className={styles.legendCircle} style={bgColorStyle.current} />
          {title}
        </div>
        <div className={styles.expandButton} onClick={toggleExpand}>
          <ExpandIcon className="icon-regular" />
        </div>
      </div>
      <canvas id="timeSeriesChart" ref={chartRef} />
    </div>
  );
}

export default TimeSeriesChart;
