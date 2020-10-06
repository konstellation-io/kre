import React, { FC, useRef, useState } from 'react';

import { Button } from 'kwc';
import HelpIcon from '@material-ui/icons/Help';
import InfoModal from './InfoModal';
import styles from './Box.module.scss';

const Info: FC = ({ children }) => {
  const [modalOpened, setModalOpened] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const openModal = () => setModalOpened(true);
  const closeModal = () => setModalOpened(false);

  return (
    <div className={styles.help}>
      <div className={styles.helpButton} ref={buttonRef}>
        <Button Icon={HelpIcon} label="" onClick={openModal} />
      </div>
      <InfoModal containerRef={buttonRef} closeModal={closeModal}>
        {modalOpened ? children : ''}
      </InfoModal>
    </div>
  );
};

export default Info;
