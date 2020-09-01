import 'Chart.js/defaultProps';

import React, { MouseEvent, useCallback, useEffect, useRef } from 'react';

import Chart from 'chart.js';
import IconExpand from '@material-ui/icons/KeyboardArrowDown';
import IconShrink from '@material-ui/icons/KeyboardArrowUp';
import { color as c } from 'd3-color';
import { createCustomTooltip } from 'Chart.js/tooltip';
import cx from 'classnames';
import styles from './TimeSeriesChart.module.scss';

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
  formatXAxis?: (value: string) => string;
  formatYAxis?: (value: number) => string;
  highlightLastValue?: boolean;
  removed?: number;
  color?: string;
};
function TimeSeriesChart({
  data,
  unit,
  title,
  expanded,
  toggleExpand,
  highlightLastValue,
  removed = 0,
  color = '#f00',
  formatXAxis = v => v,
  formatYAxis = v => v.toString()
}: Props) {
  const chart = useRef<Chart | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { r, g, b } = getRGB(color);
  const colorStyle = useRef({ color });
  const bgColorStyle = useRef({ backgroundColor: color });
  const ExpandIcon = expanded ? IconShrink : IconExpand;

  const formatYWUnit = (v: number) => `${formatYAxis(v)}${unit}`;

  // Initialize chart
  useEffect(() => {
    const context2D = chartRef?.current?.getContext('2d');
    if (context2D) {
      chart.current = new Chart(context2D, {
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
          tooltips: {
            callbacks: {
              label: d => formatYWUnit(d.value ? +d.value : 0)
            },
            custom: createCustomTooltip(formatXAxis, color, title)
          },
          scales: {
            xAxes: [
              {
                type: 'time',
                display: false,
                time: {
                  unit: 'minute'
                },
                ticks: {
                  display: false
                },
                gridLines: {
                  display: false,
                  drawBorder: false
                }
              }
            ],
            yAxes: [
              {
                display: false,
                ticks: {
                  display: false,
                  mirror: true,
                  maxTicksLimit: 6,
                  fontStyle: 'bold',
                  padding: -8,
                  callback: formatYWUnit,
                  beginAtZero: true
                },
                gridLines: {
                  display: false,
                  color: '#000',
                  drawTicks: false,
                  z: -100,
                  drawBorder: false
                }
              }
            ]
          }
        }
      });
    }
    // We only want to execute this after mounting
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateScales = useCallback(() => {
    if (chart?.current?.options.scales?.yAxes) {
      chart.current.options.scales.yAxes = [
        {
          ...chart.current.options.scales.yAxes,
          display: expanded,
          ticks: {
            ...chart.current.options.scales.yAxes[0].ticks,
            display: expanded
          },
          afterTickToLabelConversion: function(scaleInstance) {
            scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;
            scaleInstance.ticksAsNumbers[
              scaleInstance.ticksAsNumbers.length - 1
            ] = null;
          },
          gridLines: {
            ...chart.current.options.scales.yAxes[0].gridLines,
            display: expanded
          }
        }
      ];
    }
  }, [expanded]);

  useEffect(() => {
    updateScales();
    chart.current && chart.current.update();
  }, [updateScales]);

  useEffect(() => {
    function getLabels() {
      return chart.current?.data.labels || [];
    }
    function getDataset() {
      return (
        (chart.current?.data.datasets && chart.current.data.datasets[0].data) ||
        []
      );
    }

    function removeData(n: number) {
      for (let i = 0; i < n; i++) {
        getLabels().shift();
        getDataset().shift();
      }
    }

    function addData(newData: D[]) {
      newData.forEach(d => {
        getLabels().push(d.x);
        getDataset().push(d.y || 0);
      });
    }

    if (data && chart.current) {
      removeData(removed);

      const prevDataLenght = chart.current.data?.labels?.length || 0;
      const dataToAdd = data.slice(prevDataLenght + removed);
      addData(dataToAdd);

      updateScales();

      chart.current.update();
    }
    // updateScales should not be added as this function changes when the chart do not expand
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, removed]);

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
