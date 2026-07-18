import React, { HTMLAttributes } from 'react';
import './Card.css';

export const Card: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div className={`card glass-panel ${className}`} {...props}>
      {children}
    </div>
  );
};
