import { ToastContainer, Zoom } from 'react-toastify';

import LinkTable from '../components/LinkTable';
import ShortenerWidget from '../components/Shortener';
import { ShortenerProvider } from '../contexts/ShortenerContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import AnalyticsMap from './AnalyticsMap';
import type { FC } from 'react';

export function ShortenerViewContextWrapper () {
    return (
        <ShortenerProvider>
            <section className="my-6">
				<ShortenerWidget isLoggedIn={true} />
			</section>
            <section className='my-4'>
                <LinkTable />
            </section>
            <ToastContainer autoClose={3000} transition={Zoom} />
		</ShortenerProvider>
    );
}

interface AnalyticsContextWrapperProps {
    id: string
}

export const AnalyticsContextWrapper: FC<AnalyticsContextWrapperProps> = ({ id }) => {
    return (
        <AnalyticsProvider>
            <ShortenerProvider>
                <AnalyticsMap id={id} />
            </ShortenerProvider>
            <ToastContainer autoClose={3000} transition={Zoom} />
        </AnalyticsProvider>
    )
}