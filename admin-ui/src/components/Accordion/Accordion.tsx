import React, { useState } from 'react';
import styles from './Accordion.module.scss';
import IconDeviceHub from '@material-ui/icons/DeviceHub';
import IconExpandMore from '@material-ui/icons/ExpandMore';
import IconExpandLess from '@material-ui/icons/ExpandLess';
import cx from 'classnames';

type AccordionProps = {
  label: string;
  children: any;
  customStyles?: object;
  subHeader: any;
};

function Accordion({
  label,
  subHeader,
  children,
  customStyles = {}
}: AccordionProps) {
  const [isOpen, setOpen] = useState<boolean>(true);

  function onLabelClick() {
    setOpen(!isOpen);
  }

  return (
    <div
      className={cx(styles.wrapper, { [styles.opened]: isOpen })}
      style={customStyles}
    >
      <div className={styles.header} onClick={onLabelClick}>
        <div className={styles.icon}>
          <IconDeviceHub className="icon-small" />
        </div>
        <span>{label}</span>
        <div className={styles.arrow}>
          {isOpen ? (
            <IconExpandMore className="icon-small" />
          ) : (
            <IconExpandLess className="icon-small" />
          )}
        </div>
      </div>
      <div className={cx(styles.content, { [styles.opened]: isOpen })}>
        {isOpen && (
          <>
            <div className={styles.subHeader}>{subHeader}</div>
            {children}
          </>
        )}
      </div>
    </div>
  );
}

export default Accordion;
