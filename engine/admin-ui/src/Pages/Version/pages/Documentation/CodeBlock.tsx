import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { CodeProps } from 'react-markdown/lib/ast-to-react';

const CodeBlock = ({ children, className }: CodeProps) => {
  const match = /language-(\w+)/.exec(className || '');
  const snippet = String(children).replace(/\n$/, '');
  return (
    <SyntaxHighlighter
      style={monokai}
      language={match ? match[1] : ''}
      children={snippet}
    />
  );
};

export default CodeBlock;
