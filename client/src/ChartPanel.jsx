import {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';

import './ChartPanel.css';
import './Panel.css';

import cbgMedianIncomeJson from './data/cbg_median_income.json';

const SIGMA_MIN = -2;
const SIGMA_MAX = 2;

export function ChartPanel({dataState, mapState}) {
  const [expanded, setExpanded] = useState(true);
  const [hoveredIncome, setHoveredIncome] = useState(0);
  const [hoveredIncomeValue, setHoveredIncomeValue] = useState(0);
  const [hoveredStdValue, setHoveredStdValue] = useState(0);
  const [hoveredValue, setHoveredValue] = useState('');
  const [keys, setKeys] = useState([]);
  const [incomeKeys, setIncomeKeys] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [incomeValues, setIncomeValues] = useState([]);
  const [values, setValues] = useState([]);

  const classNamePanel = [
    'panel',
    'panel-right',
    'chart-panel',
    expanded ? 'expanded' : '',
  ].filter((className) => className.length).join(' ');

  const classNameIcon = 'far fa-chart-bar';

  // Set hovered CBG value.
  useEffect(() => {
    if (mapState.hoveredCbg === null) {
      setHoveredValue('');
    } else if (mapState.hoveredCbg.value <= 1) {
      setHoveredValue(mapState.hoveredCbg.value.toFixed(4));
    } else if (mapState.hoveredCbg.value <= 10) {
      setHoveredValue(mapState.hoveredCbg.value.toFixed(3));
    } else {
      setHoveredValue(mapState.hoveredCbg.value.toFixed(2));
    }
  }, [mapState, setHoveredValue]);

  useEffect(() => {
    if (mapState.hoveredCbg === null) {
      setHoveredIncome(0);
      setHoveredIncomeValue(0);
    } else {
      const incomeJson = cbgMedianIncomeJson['median_household_income'];
      const key = mapState.hoveredCbg.id;
      const x = incomeJson[key];
      const y = dataState.cbgValueMap.get(key);
      if (x === null || y === null) {
        setHoveredIncome(0);
        setHoveredIncomeValue(0);
        return;
      }
      setHoveredIncome(incomeJson[key]);
      setHoveredIncomeValue(dataState.cbgValueMap.get(key));
    }
  }, [
    dataState, incomes, incomeValues, mapState, setHoveredIncome,
    setHoveredIncomeValue,
  ]);

  useEffect(() => {
    if (mapState.hoveredCbg === null) {
      setHoveredStdValue(0);
    } else {
      const cbgId = mapState.hoveredCbg.id;
      const stdValue = dataState.cbgStandardizedValueMap.get(cbgId);
      setHoveredStdValue(Math.min(Math.max(stdValue || 0, SIGMA_MIN), SIGMA_MAX));
    }
  }, [dataState, mapState, setHoveredStdValue]);

  // Set keys.
  useEffect(() => {
    const keys = [...dataState.cbgStandardizedValueMap.keys()];
    setKeys(keys);
    setValues([...dataState.cbgStandardizedValueMap.values()]);

    const incomeJson = cbgMedianIncomeJson['median_household_income'];

    const incomeKeys = [];
    const incomes = [];
    const incomeValues = [];

    for (const key of keys) {
      const x = incomeJson[key];
      const y = dataState.cbgValueMap.get(key);
      const t = key;

      if (x && y) {
        incomeKeys.push(t);
        incomes.push(x);
        incomeValues.push(y);
      }
    }

    setIncomes(incomes);
    setIncomeKeys(incomeKeys);
    setIncomeValues(incomeValues);

  }, [dataState, setIncomeKeys, setIncomes, setIncomeValues, setKeys, setValues]);

  return (
    <div className={classNamePanel}>
      <div className="panel-content">
        <div className="value-row">
          <strong>CBG:</strong>
          <span>{mapState.hoveredCbg?.id}</span>
        </div>
        <div className="value-row">
          <strong>Value:</strong>
          <span>{hoveredValue}</span>
        </div>
        <div className="value-row">
          <strong>Income:</strong>
          <span>{hoveredIncome.toLocaleString()}</span>
        </div>

        <div className="plot-container">
          <Plot
            data={[
              {
                type: 'histogram',
                x: values,
                marker: {
                  color: '#8900e1',
                },
              },
            ]}
            layout={{
              height: 80,
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              width: 196,
              margin: {
                b: 0,
                l: 0,
                pad: 0,
                r: 0,
                t: 0,
              },
              shapes: [
                {
                  type: 'line',
                  x0: 0,
                  x1: 0,
                  y0: 0,
                  y1: 1,
                  yref: 'paper',
                  line: {
                    color: '#fff',
                    width: 0.8,
                  },
                },
                {
                  type: 'line',
                  x0: hoveredStdValue,
                  x1: hoveredStdValue,
                  y0: 0,
                  y1: 1,
                  yref: 'paper',
                  line: {
                    color: '#fff',
                    width: 1,
                  },
                },
              ],
              xaxis: {
                range: [-3, 3],
              },
              yaxis: {
                gridcolor: 'transparent',
              },
            }}
          />

          <Plot
            data={[
              {
                type: 'scatter',
                mode: 'markers',
                x: incomes,
                y: incomeValues,
                text: incomeKeys,
                marker: {
                  color: '#c466ff',
                  size: 2,
                  opacity: 0.3,
                },
              },
            ]}
            layout={{
              height: 196,
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              width: 196,
              margin: {
                b: 0,
                l: 0,
                pad: 0,
                r: 0,
                t: 0,
              },
              shapes: [
                {
                  type: 'circle',
                  xanchor: hoveredIncome,
                  yanchor: hoveredIncomeValue,
                  x0: -3,
                  x1: 3,
                  y0: -3,
                  y1: 3,
                  xref: 'x',
                  yref: 'y',
                  xsizemode: 'pixel',
                  ysizemode: 'pixel',
                  fillcolor: '#fff',
                },
              ],
              xaxis: {
                gridcolor: 'transparent',
                zerolinecolor: '#999',
              },
              yaxis: {
                gridcolor: 'transparent',
                zerolinecolor: '#999',
              },
            }}
          />
        </div>
      </div>
      <button onClick={() => setExpanded(!expanded)}>
        <i className={classNameIcon}></i>
      </button>
    </div>
  );
}
