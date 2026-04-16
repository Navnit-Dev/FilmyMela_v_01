'use client';

import { useBootScreen } from './boot-screen-provider';
import BootScreen from './boot-screen';

export default function UserLayout({ children }) {
  const { bootScreenComplete } = useBootScreen();

  return (
    <>
      <BootScreen />
      <div style={{ 
        opacity: bootScreenComplete ? 1 : 0, 
        transition: 'opacity 0.8s ease-in-out',
        pointerEvents: bootScreenComplete ? 'auto' : 'none'
      }}>
        {children}
      </div>
    </>
  );
}
