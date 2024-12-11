import { Link } from 'react-aria-components';
import clipboard from 'clipboardy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons';

import { useShortener } from '../contexts/ShortenerContext';
import { Pagination } from './Pagination';

interface LinkRow {
    id: number,
    originalUrl: string,
    shortId: string,
    shortUrl: string,
    clicks?: number
}

export default function LinkTable () {
    const { 
        total, 
        links, 
        cursor, 
        setCursor,
        hasNew
    } = useShortener();

    if (!links || !links.length) {
        return (
            <div className='py-3 flex flex-col justify-center items-center w-full'>
                <FontAwesomeIcon icon={faLink} size="6x" style={{color: 'hsl(0, 0%, 75%)'}} />
                <h2 className='mt-6 text-center lg:text-[3.5rem] text-[2.625rem] font-bold tracking-[-0.066em] text-very-dark-blue'>No links found.</h2>
            </div>
        );
    }

    const doCopy = async (shortId: string) => {
        await clipboard.write(shortId); 
    };
    
    return (
        <>
            <table className="mt-12 table-fixed w-full">
			    <thead>
			        <tr className='text-center h-10'>
				        <th>Original URL</th>
				        <th>Short Code</th>
				        <th>Clicks</th>
			        </tr>
			    </thead>
			    <tbody>
                    {
                        links ? links.map((link: LinkRow, index: number) => (
                            <tr key={link.id} className={`${hasNew && (links.length - 1) === index ? 'bg-cyan text-white animate-pulse opacity-75' : ''} text-center text-very-dark-blue hover:text-grayish-violet divide-y divide-gray h-10 cursor-pointer`}>
				                <td className='truncate overflow-x-hidden border-t border-gray w-1/2'>
                                    <Link href={link.originalUrl} target='_blank'>{ link.originalUrl }</Link>
                                </td>
				                <td onClick={(_) => doCopy(link.shortUrl)} className=''>{ link.shortId }</td>
				                <td className=''>0</td>
                                <td className='text-red'>
                                    <Link href={`/view/${link.shortId}`}>Inspect</Link>
                                </td>
			                </tr>
                        )) : null
                    }
		        </tbody>
		    </table>
            <Pagination curPage={cursor} nextPage={setCursor} total={total} />
        </>
    );
}