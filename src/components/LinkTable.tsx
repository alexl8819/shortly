import { useState, useEffect } from 'react';
import { Button, Link } from 'react-aria-components';
import { useShortener } from '../contexts/ShortenerContext';

interface LinkRow {
    id: number,
    originalUrl: string,
    shortId: string,
    clicks?: number
}

export default function LinkTable () {
    const { total, links, cursor, setCursor } = useShortener();

    // TODO: display skeleton
    if (!links) {
        return null;
    }

    const changeCursor = (page: number) => setCursor(page);

    // TODO: move to pagination component?
    const pages = new Array(Math.ceil(total / 10)).fill(1);
    
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
                        links ? links.map((link, index) => (
                            <tr key={index} className='text-center text-very-dark-blue hover:text-grayish-violet divide-y divide-gray h-10 cursor-pointer'>
				                <td className='truncate overflow-x-hidden border-t border-gray w-1/2'>
                                    <Link href={link.originalUrl} target='_blank'>{ link.originalUrl }</Link>
                                </td>
				                <td className=''>{ link.shortId }</td>
				                <td className=''>0</td>
                                <td className='text-red'>Inspect</td>
			                </tr>
                        )) : null
                    }
		        </tbody>
		    </table>
            <ol className='mt-4 list-none flex flex-row justify-center items-center space-x-6 w-full'>
                {
                    pages ? pages.map((_, index) => (
                        <li key={index} className={`${cursor === index ? 'font-bold' : ''} disabled:cursor-not-allowed`}>
                            <Button 
                                onPress={(_) => changeCursor(index)}
                                isDisabled={cursor === index}
                            >
                                { (index + 1) }
                            </Button>
                        </li>
                    )) : null
                }
            </ol>
        </>
    );
}