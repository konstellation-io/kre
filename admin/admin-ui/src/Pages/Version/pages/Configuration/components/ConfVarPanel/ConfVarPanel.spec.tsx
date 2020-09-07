import { BrowserRouter } from 'react-router-dom';
import ConfVarPanel from './ConfVarPanel';
import { ConfigurationVariableType } from 'Graphql/types/globalTypes';
import React from 'react';
import { mountApolloComponent } from 'Utils/testUtilsEnzyme';

jest.mock('index', () => ({
  API_BASE_URL: 'url'
}));

const panelInfo = {
  key: 'key',
  type: ConfigurationVariableType.FILE,
  value: 'some value'
};
const Component = () => (
  <BrowserRouter>
    <ConfVarPanel varPanel={panelInfo} closePanel={() => {}} />
  </BrowserRouter>
);

describe('ConfVarPanel', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = await mountApolloComponent(<Component />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
