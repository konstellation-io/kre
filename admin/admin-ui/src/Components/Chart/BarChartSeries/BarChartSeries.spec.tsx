import React from 'react';
import { shallow } from 'enzyme';
import BarChartSeries from './BarChartSeries';

describe('BarChartSeries component', () => {
  let wrapper;

  const dataMock = [
    {
      title: 'foo',
      data: [
        { x: 5, y: 'foo' },
        { x: 10, y: 'bar' }
      ]
    }
  ];
  const heightMock = 100;
  const marginMock = { top: 5, right: 5, bottom: 5, left: 5 };
  const widthMock = 100;
  beforeEach(() => {
    jest.resetAllMocks();
    wrapper = shallow(
      <BarChartSeries
        data={dataMock}
        height={heightMock}
        margin={marginMock}
        width={widthMock}
      />
    );
  });

  it('should render without crashing', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
