import { Link } from 'react-router-dom';
import React from 'react';

type CustomLinkProps = {
  href: string;
  children: JSX.Element[];
};

const CustomLink = ({href, children}: CustomLinkProps) => <Link to={href}>{children}</Link>;

export default CustomLink;
