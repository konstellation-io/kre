import React from 'react';
import { Link } from 'react-router-dom';

export const buildRoute = {
  runtime: function(route: string, runtimeId: string = ''): string {
    return route.replace(':runtimeId', runtimeId);
  },
  version: function(
    route: string,
    runtimeId: string = '',
    versionId: string = ''
  ): string {
    return route
      .replace(':runtimeId', runtimeId)
      .replace(':versionId', versionId);
  }
};

type Props = {
  children: any;
  to: string;
  LinkType?: typeof Link;
  linkProps?: object;
  disabled?: boolean;
};
export function ConditionalLink({
  LinkType = Link,
  children,
  to = '',
  disabled = false,
  linkProps = {}
}: Props) {
  return !disabled ? (
    <LinkType to={to} {...linkProps}>
      {children}
    </LinkType>
  ) : (
    children
  );
}
