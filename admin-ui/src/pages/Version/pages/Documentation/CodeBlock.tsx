import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';

type Props = {
  value: string;
  language: string | undefined;
};

const CodeBlock = ({ value, language = undefined }: Props) => (
  <SyntaxHighlighter language={language} style={monokai}>
    {value}
  </SyntaxHighlighter>
);

export default CodeBlock;
