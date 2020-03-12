import React from 'react';
import PageBase from './PageBase';
import Header from '../../Header/Header';
import NavigationBar from '../../NavigationBar/NavigationBar';
import { shallow } from 'enzyme';

describe('PageBase', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <PageBase>
        <div className="element">Element</div>
      </PageBase>
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('contains right components', async () => {
    expect(wrapper.exists(Header)).toBeTruthy();
    expect(wrapper.exists(NavigationBar)).toBeTruthy();
    expect(wrapper.exists('.element')).toBeTruthy();
  });

  it('allows the addition of children to the header', async () => {
    const headerChildren = <span className="headerChildren">Child</span>;
    wrapper.setProps({ headerChildren });

    expect(wrapper.find(Header).exists('.headerChildren')).toBeTruthy();
    expect(wrapper.find('.content').exists('.headerChildren')).toBeFalsy();
  });
});
