'use client';

import Link from 'next/link';
import * as React from 'react';

// Define the props for LinkBehavior
interface LinkBehaviorProps {
  href: string;
  children?: React.ReactNode;
  // Add any other props that Link might accept and you want to pass through
  // For example, if you pass props like `onClick` or `className`
  // You can extend Link's props here if needed, but for now, this covers the basics.
}

const LinkBehavior = React.forwardRef<HTMLAnchorElement, LinkBehaviorProps>(function LinkBehavior(props, ref) {
  const { href, children, ...other } = props;
  return (
    <Link ref={ref} href={href} {...other}>
      {children}
    </Link>
  );
});

export default LinkBehavior;