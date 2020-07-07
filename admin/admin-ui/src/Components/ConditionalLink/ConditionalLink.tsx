import React, { ReactElement, FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  children: ReactElement;
  to: string;
  LinkType?: typeof Link;
  linkProps?: object;
  disabled?: boolean;
};
const ConditionalLink: FunctionComponent<Props> = ({
  LinkType = Link,
  children,
  to = '',
  disabled = false,
  linkProps = {}
}) => {
  return !disabled ? (
    <LinkType to={to} {...linkProps}>
      {children}
    </LinkType>
  ) : (
    children
  );
};

export default ConditionalLink;
