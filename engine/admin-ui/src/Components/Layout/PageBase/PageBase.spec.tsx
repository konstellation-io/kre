import { BrowserRouter } from 'react-router-dom';
import Header from '../../Header/Header';
import { MockedProvider } from '@apollo/client/testing';
import NavigationBar from '../../NavigationBar/NavigationBar';
import PageBase from './PageBase';
import React from 'react';
import { mountApolloComponent } from 'Utils/testUtilsEnzyme';
import { usernameMock } from 'Mocks/auth';

const mocks = [usernameMock];

function Wrapper({ mocks }: any) {
  return (
    <BrowserRouter>
      <MockedProvider mocks={mocks} addTypename={false}>
        <PageBase
          headerChildren={<span className="headerChildren">Child</span>}
        >
          <div className="element">Element</div>
        </PageBase>
      </MockedProvider>
    </BrowserRouter>
  );
}
const Component = <Wrapper mocks={mocks} />;

describe('PageBase', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = await mountApolloComponent(Component);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('contains right components', () => {
    expect(wrapper.exists(Header)).toBeTruthy();
    expect(wrapper.exists(NavigationBar)).toBeTruthy();
    expect(wrapper.exists('.element')).toBeTruthy();
  });

  it('allows the addition of children to the header', () => {
    expect(wrapper.find(Header).exists('.headerChildren')).toBeTruthy();
    expect(wrapper.find('.content').exists('.headerChildren')).toBeFalsy();
  });
});
