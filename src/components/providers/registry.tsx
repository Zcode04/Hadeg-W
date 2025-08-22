'use client';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource) => fetch(resource).then((res) => res.json()),
      }}
    >
      {children}
    </SWRConfig>
  );
}