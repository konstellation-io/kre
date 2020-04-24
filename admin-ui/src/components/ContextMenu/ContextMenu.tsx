import React, { ReactElement, useEffect, useRef, useState } from 'react';
import styles from './ContextMenu.module.scss';
import useClickOutsideListener from '../../hooks/useClickOutsideListener';

type Props = {
  children: ReactElement;
};

interface ContextMenu {
  isVisible: boolean;
  x: number;
  y: number;
}

function ContextMenu({ children }: Props) {
  const childElement = useRef<any>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [stateContextMenu, setStateContextMenu] = useState<ContextMenu>({
    isVisible: false,
    x: 0,
    y: 0
  });
  function onRightClick(event: any) {
    console.log('clicked right', event);
    event.preventDefault();
    const clickX = event.clientX;
    const clickY = event.clientY;
    setStateContextMenu({
      isVisible: true,
      x: clickX,
      y: clickY
    });
  }
  function removeListener() {
    if (childElement && childElement.current) {
      childElement.current.removeEventListener('contextmenu', onRightClick);
    }
  }
  useEffect(() => {
    if (childElement && childElement.current) {
      childElement.current.addEventListener('contextmenu', onRightClick);
      return removeListener;
    }
  }, []);

  useClickOutsideListener({
    ref: contextMenuRef,
    onClickOutside: () => {
      setStateContextMenu({
        isVisible: false,
        x: 0,
        y: 0
      });
    }
  });

  return (
    <>
      {stateContextMenu.isVisible && (
        <div
          className={styles.contextMenuContainer}
          ref={contextMenuRef}
          style={{
            position: 'absolute',
            left: `${stateContextMenu.x + 5}px`
          }}
        >
          facciamo una prova
        </div>
      )}
      {React.cloneElement(children, { ref: childElement })}
    </>
  );
}

export default ContextMenu;
