'use client';

import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import { RefTracker } from '@/components/RefTracker';
import ShutdownNoticeModal from '@/components/ShutdownNoticeModal';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider refetchOnWindowFocus={false}>
            <ShutdownNoticeModal />
            <Suspense fallback={null}>
                <RefTracker />
            </Suspense>
            {children}
        </SessionProvider>
    );
}
