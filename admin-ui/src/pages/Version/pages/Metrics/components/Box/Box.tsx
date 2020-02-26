import React, { FunctionComponent, ReactElement } from 'react';
import styles from './Box.module.scss';

type Props = {
  children?: ReactElement | ReactElement[];
};
const Box: FunctionComponent<Props> = ({ children }) => {
  return (
    <section className={styles.container}>
      <div className={styles.content}>{children}</div>
    </section>
  );
};

export default Box;
