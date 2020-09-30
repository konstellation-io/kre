import React, { FC, RefObject, useEffect, useRef, useState } from 'react';

import chartStyles from '../Charts/Charts.module.scss';
import { createPortal } from 'react-dom';
import cx from 'classnames';
import styles from './Box.module.scss';
import { useClickOutside } from 'kwc';

const MARGIN_RIGHT = 16;

type Coords = {
  top: number;
  left: number;
};

const Modal: FC = ({ children }) => {
  let modal = document.getElementsByClassName(chartStyles.modal)[0];

  return modal ? createPortal(children, modal) : null;
};

type Props = {
  containerRef: RefObject<HTMLDivElement>;
  closeModal: Function;
};
const InfoModal: FC<Props> = ({ children, containerRef, closeModal }) => {
  const modalRef = useRef(null);
  const [coords, setCoords] = useState<Coords>({ top: 0, left: 0 });
  const { addClickOutsideEvents, removeClickOutsideEvents } = useClickOutside({
    componentRef: modalRef,
    action: () => closeModal()
  });
  const parent = document.getElementsByClassName(chartStyles.wrapper)[0];

  useEffect(() => {
    if (children && containerRef.current) {
      const modalDims = containerRef.current.getBoundingClientRect();
      const parentDims = parent.getBoundingClientRect();
      setCoords({
        top:
          modalDims.y - parentDims.y + parent.scrollTop + modalDims.height / 2,
        left: modalDims.x - parentDims.x - MARGIN_RIGHT
      });
      addClickOutsideEvents();
    } else {
      removeClickOutsideEvents();
    }
    // Visibility only changes with children content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  return (
    <Modal>
      {children && (
        <div
          className={cx(styles.modalContainer, {
            [styles.visible]: !!children
          })}
          style={coords}
          ref={modalRef}
        >
          {children}
        </div>
      )}
    </Modal>
  );
};

export default InfoModal;
