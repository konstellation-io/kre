import React, {useState, useEffect} from 'react';
import Button, { BUTTON_TYPES, BUTTON_ALIGN } from '../Button/Button';
import styles from './NavBar.module.scss';


export type Tab = {
  label: string,
  route?: string,
  Icon?: any,
}
type Props = {
  tabs: Tab[];
  defaultActive?: number;
  onChange?: Function;
};

function NavBar({
  tabs,
  defaultActive = 0,
  onChange = function(idx:number) {}
}: Props) {
  const [activeTab, setActiveTab] = useState(defaultActive);

  useEffect(() => {
    setActiveTab(defaultActive);
  }, [defaultActive]);

  const tabElements = tabs.map((tab, idx) => (
    <Button
      key={`tabButton${idx}`}
      label={tab.label}
      Icon={tab.Icon}
      primary={activeTab === idx}
      type={ BUTTON_TYPES.TRANSPARENT }
      height={56}
      onClick={() => {
        setActiveTab(idx);
        onChange(idx);
      }}
      align={BUTTON_ALIGN.LEFT}
      to={tab.route}
    />
  ));

  return (
    <div className={styles.container}>
      {tabElements}
    </div>
  );
}

export default NavBar;
