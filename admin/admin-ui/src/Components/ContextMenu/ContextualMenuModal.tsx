import { FC, useEffect } from 'react';
import { createPortal } from 'react-dom';

const contextualMenuDiv = document.getElementById('contextual-menu');

const ContextualMenuModal: FC = ({ children }) => {
  const modal = document.createElement('div');

  useEffect(() => {
    contextualMenuDiv?.appendChild(modal);

    return () => {
      contextualMenuDiv?.removeChild(modal);
    };
  }, [modal]);

  return createPortal(children, modal);
};

export default ContextualMenuModal;
