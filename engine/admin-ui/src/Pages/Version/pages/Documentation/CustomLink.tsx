import { Link } from 'react-router-dom';
import React, {
  AnchorHTMLAttributes,
  ClassAttributes,
  PropsWithChildren,
} from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';

const CustomLink = ({
  href,
  children,
}: PropsWithChildren<
  ClassAttributes<HTMLAnchorElement> &
    AnchorHTMLAttributes<HTMLAnchorElement> &
    ReactMarkdownProps
>) => <Link to={String(href)}>{children} Testing</Link>;

export default CustomLink;
