import React from 'react';

const AnimatedLogo: React.FC = () => {
  return (
    <svg
      className="h-8 w-8 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g>
        <path
          d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.73 21a2 2 0 0 1-3.46 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="logo-clapper"
        />
        <circle
          cx="19"
          cy="5"
          r="2"
          fill="currentColor"
          className="logo-dot"
        />
      </g>
    </svg>
  );
};

export default AnimatedLogo;