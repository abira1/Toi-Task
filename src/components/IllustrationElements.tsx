import React from 'react';
export const Blob1 = ({ className }: {className?: string;}) =>
<svg
  viewBox="0 0 200 200"
  className={className}
  xmlns="http://www.w3.org/2000/svg">

    <path
    fill="currentColor"
    d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.9C87.4,-34.7,90.1,-20.4,85.8,-8.3C81.5,3.8,70.2,13.7,60.8,22.6C51.4,31.5,43.9,39.4,35.1,45.8C26.3,52.2,16.2,57.1,5.2,58.8C-5.8,60.5,-17.7,59,-28.9,54.8C-40.1,50.6,-50.6,43.7,-59.3,34.5C-68,25.3,-74.9,13.8,-76.3,1.5C-77.7,-10.8,-73.6,-23.9,-65.8,-34.6C-58,-45.3,-46.5,-53.6,-34.6,-62.3C-22.7,-71,-10.4,-80.1,2.8,-84.9C16,-89.7,30.5,-73.6,44.7,-76.4Z"
    transform="translate(100 100)" />

  </svg>;

export const Blob2 = ({ className }: {className?: string;}) =>
<svg
  viewBox="0 0 200 200"
  className={className}
  xmlns="http://www.w3.org/2000/svg">

    <path
    fill="currentColor"
    d="M41.3,-72.2C54.4,-63.9,66.6,-54.6,75.4,-43.1C84.2,-31.6,89.6,-17.9,88.9,-4.3C88.2,9.3,81.4,22.8,72.4,34.3C63.4,45.8,52.2,55.3,40.2,62.8C28.2,70.3,15.4,75.8,1.9,72.5C-11.6,69.2,-25.8,57.1,-38.4,47.3C-51,37.5,-62,30,-68.5,19.3C-75,8.6,-77,-5.3,-72.6,-17.4C-68.2,-29.5,-57.4,-39.8,-46.1,-48.7C-34.8,-57.6,-23,-65.1,-10.7,-67.2C1.6,-69.3,13.9,-66,28.2,-80.5"
    transform="translate(100 100)" />

  </svg>;

export const Squiggle = ({ className }: {className?: string;}) =>
<svg
  width="100"
  height="20"
  viewBox="0 0 100 20"
  className={className}
  xmlns="http://www.w3.org/2000/svg">

    <path
    d="M0,10 Q12.5,0 25,10 T50,10 T75,10 T100,10"
    fill="none"
    stroke="#FF6B6B"
    strokeWidth="6"
    strokeLinecap="round"
    strokeDasharray="8 4" />

  </svg>;

export const Star = ({ className }: {className?: string;}) =>
<svg
  viewBox="0 0 24 24"
  className={className}
  xmlns="http://www.w3.org/2000/svg">

    <path
    fill="currentColor"
    d="M12 0L14.5 9L23.5 12L14.5 15L12 24L9.5 15L0.5 12L9.5 9L12 0Z" />

  </svg>;

export const Sparkles = ({ className }: {className?: string;}) =>
<div className={`relative ${className}`}>
    <Star className="absolute top-0 left-0 w-4 h-4 text-yellow-400 animate-pulse" />
    <Star className="absolute top-4 right-0 w-3 h-3 text-teal-400 animate-bounce" />
    <Star className="absolute bottom-0 left-4 w-5 h-5 text-coral-400 animate-pulse delay-75" />
  </div>;