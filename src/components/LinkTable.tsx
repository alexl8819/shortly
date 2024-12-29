import { useEffect } from 'react';
import { Link } from 'react-aria-components';
import clipboard from 'clipboardy';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons';

import { useShortener } from '../contexts/ShortenerContext';
import { ModalProvider } from '../contexts/ModalContext';
import { ConfirmModal } from './Modal';
import { Pagination } from './Pagination';
import { ModalDeleteTrigger } from './ModalTrigger';

import { TableSkeleton } from './Skeleton';
import { QUERY_LIMIT } from '../lib/constants';
import { hasExpired } from '../lib/common';

interface LinkRow {
    id: number,
    originalUrl: string,
    shortId: string,
    shortUrl: string,
    clicks: number,
    expiresAt: string | Date | null
}

export default function LinkTable () {
    const { 
        total, 
        links, 
        cursor, 
        setCursor,
        hasNew,
        isLoading,
        fetchAllLinks
    } = useShortener();

    if (links && !links.length) {
        return (
            <div className='py-3 flex flex-col justify-center items-center w-full'>
                <FontAwesomeIcon icon={faLink} size="6x" style={{color: 'hsl(0, 0%, 75%)'}} />
                <h2 className='mt-6 text-center lg:text-[3.5rem] text-[2.625rem] font-bold tracking-[-0.066em] text-very-dark-blue'>No links found.</h2>
            </div>
        );
    }

    const doCopy = async (shortIdLink: string) => {
        toast.info(`Copied ${shortIdLink} to clipboard`, {
            role: 'alert'
        });
        await clipboard.write(shortIdLink);
    };

    const actionResultCallback = (shortId: string, hasSuccess: boolean) => {
        if (hasSuccess) {
            toast.success(`Successfully removed (${shortId})`);
            return;
        }
        toast.error(`Failed to remove link (${shortId})`);
    }
    
    useEffect(() => {
        if (cursor < 0) {
            return;
        }

        fetchAllLinks();
    }, [cursor]);

    return (
        <ModalProvider>
            {
                isLoading && !links?.length ? <TableSkeleton cols={4} rows={10} /> : (
                    <table className="mt-12 min-h-[9rem] table-fixed w-full">
			            <thead>
			                {
                                links ? (<tr className='text-center h-10'>
				                    <th>Original URL</th>
				                    <th>Short URL</th>
				                    <th>Clicks</th>
			                    </tr>) : null
                            }
			            </thead>
			            <tbody>
                            {
                                links ? links.map((link: LinkRow, index: number) => (
                                    <tr key={link.id} className={`${hasNew && (links.length - 1) === index ? 'bg-cyan text-white animate-pulse opacity-75' : ''} text-center text-very-dark-blue hover:text-grayish-violet divide-y divide-gray h-12 cursor-pointer`}>
				                        <td className='truncate overflow-x-hidden border-t border-gray w-1/2'>
                                            <Link href={`/analytics/${link.id}`}>{ link.originalUrl }</Link>
                                        </td>
				                        <td 
                                            className={`${link.expiresAt && hasExpired(link.expiresAt) ? 'line-through' : ''}`} 
                                            onClick={(_) => link.expiresAt && hasExpired(link.expiresAt) ? {} : doCopy(link.shortUrl)}
                                        >
                                            { link.shortId }
                                        </td>
				                        <td className={link.clicks || (link.expiresAt && hasExpired(link.expiresAt)) ? 'font-bold' : ''}>{ link.clicks }</td>
                                        <td>
                                            <ModalDeleteTrigger shortId={link.shortId} callback={actionResultCallback} />
                                        </td>
			                        </tr>
                                )) : null
                            }
		                </tbody>
		            </table>
                )
            }
            <Pagination curPage={cursor} nextPage={setCursor} total={total} limit={QUERY_LIMIT} />
            <ConfirmModal title="Are you sure?" content="You are about to delete this short link" />
        </ModalProvider>
    );
}