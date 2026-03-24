import { useState } from 'react';

interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderIcon?: string;
}

export function Img({ placeholderIcon = '🍽', className, alt, ...props }: ImgProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-secondary text-4xl select-none ${className ?? ''}`}
        aria-label={alt}
      >
        {placeholderIcon}
      </div>
    );
  }

  return (
    <img
      {...props}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
