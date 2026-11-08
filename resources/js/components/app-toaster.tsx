import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useFlashToast } from '@/hooks/use-flash-toast';

/** App-wide toaster. The site has one fixed (dark) theme; styles live in app.css (.kk-toast). */
export default function AppToaster(props: ToasterProps) {
    useFlashToast();

    return (
        <Sonner
            theme="dark"
            className="toaster group"
            position="bottom-right"
            offset={20}
            visibleToasts={4}
            closeButton
            toastOptions={{ className: 'kk-toast' }}
            style={
                {
                    '--normal-bg': '#1a1415',
                    '--normal-text': '#f5f0e9',
                    '--normal-border': 'rgb(214 173 80 / 0.22)',
                    '--border-radius': '0.75rem',
                    '--width': '380px',
                } as CSSProperties
            }
            {...props}
        />
    );
}
