import React from 'react';
import { renderWithRouter } from '../../../utils/testUtils';
import FileUpload from './FileUpload';
import { render, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

function renderComponent(params = {}) {
  return renderWithRouter(<FileUpload {...params} />).element;
}

afterEach(cleanup);

it('Render FileUpload without crashing', () => {
  const { container } = renderComponent();

  expect(container).toMatchSnapshot();
});

it('show right texts', () => {
  const { getByText } = renderComponent({
    placeholder: 'some placeholder',
    label: 'some label'
  });

  expect(getByText('some placeholder')).toBeInTheDocument();
  expect(getByText('SOME LABEL')).toBeInTheDocument();
});
