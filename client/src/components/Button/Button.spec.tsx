// import React from 'react';
// import { render, fireEvent, cleanup } from '@testing-library/react';
// import Button from './Button';

// afterEach(cleanup);

// it('Render Button without crashing', () => {
//   const { container } = render(<Button />);
//   expect(container).toMatchSnapshot();
// });

// it('Shows right texts', () => {
//   const { rerender, container } = render(<Button />);
//   expect(container.textContent).toBe('Button');

//   rerender(<Button label="New Text" />);
//   expect(container.textContent).toBe('New Text');

//   rerender(
//     <Button
//       label="Other Text"
//       type="dark"
//       onClick={function() {}}
//       primary
//       disabled
//     />
//   );
//   expect(container.textContent).toBe('Other Text');
// });

// it('Handles click events', () => {
//   const clickMock = jest.fn(() => true);

//   const { getByText } = render(<Button onClick={clickMock} />);
//   fireEvent.click(getByText('Button'));

//   expect(clickMock).toHaveBeenCalledTimes(1);
// });
