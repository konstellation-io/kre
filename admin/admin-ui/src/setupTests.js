import 'jest-canvas-mock';

import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';

configure({ adapter: new Adapter() });

jest.mock('./config', () =>
  Promise.resolve({
    envVariables: jest.fn().mockReturnValue({
      API_BASE_URL: 'some value',
      MONORUNTIME_MODE: '0'
    })
  })
);

jest.mock('Hooks/useUserAccess', () => () => ({
  accessLevel: 'ADMIN',
  loading: false
}));

class ResizeObserver {
  observe() {}
  unobserve() {}
}

window.ResizeObserver = ResizeObserver;
