import { Link } from 'react-router-dom';
import React from 'react';

type CustomLinkProps = {
  href: string;
  children: JSX.Element[];
};

const CustomLink = (props: CustomLinkProps) => {
  return <Link to={props.href}>{props.children}</Link>;
};

export default CustomLink;
