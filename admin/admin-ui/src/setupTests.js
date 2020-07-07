import 'jest-canvas-mock';

import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';

configure({ adapter: new Adapter() });

jest.mock('./config', () => ({
  envVariables: jest.fn().mockReturnValue({
    API_BASE_URL: 'some value'
  })
}));

jest.mock('Hooks/useUserAccess', () => () => ({
  accessLevel: 'ADMIN',
  loading: false
}));

class ResizeObserver {
  observe() {}
  unobserve() {}
}

window.ResizeObserver = ResizeObserver;
