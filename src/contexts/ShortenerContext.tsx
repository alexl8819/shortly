import { 
    createContext, 
    useContext, 
    useState,
    type FC, 
    type PropsWithChildren
} from 'react';

import { GENERIC_ERROR_MESSAGE, QUERY_LIMIT } from '../lib/constants';
import { sanitize } from '../lib/common';

export interface ActiveLink {
    id: number,
    createdAt: string | Date,
    originalUrl: string,
    shortId: string,
    expiresAt: string | Date | null
    shortUrl: string
    clicks: number
}

const ShortenerContext = createContext<{
    links: Array<ActiveLink> | null,
    total: number,
    cursor: number,
    setCursor: (newCursor: number) => void,
    fetchAllLinks: () => void,
    createLink: (originalUrl: string) => void,
    updateLink: (shortId: string, newUrl: string) => any,
    removeLink: (shortId: string) => any,
    setExpiry: (shortId: string, expiry: string) => void,
    hasNew: boolean,
    isLoading: boolean
}>({
    links: [],
    total: 0,
    cursor: 0,
    setCursor: () => {},
    fetchAllLinks: () => {},
    createLink: () => {},
    updateLink: () => {},
    removeLink: () => {},
    setExpiry: () => {},
    hasNew: false,
    isLoading: false
});

export const useShortener = () => useContext(ShortenerContext);

export const ShortenerProvider: FC<PropsWithChildren> = ({ children }) => {
    const [cursor, setCursor] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [links, setLinks] = useState<Array<ActiveLink> | null>(null);
    const [hasNew, setHasNew] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const getOffset = (page: number, limit: number = QUERY_LIMIT) => page * limit;

    const fetchAllLinks = async () => {
        setHasNew(false);

        setIsLoading(true);

        let linkApiResponse;

        try {
            linkApiResponse = await fetch(`/api/link?limit=${QUERY_LIMIT}&index=${getOffset(cursor)}`);
        } catch (err) {
            console.error(err);
            return;
        }

        if (linkApiResponse && !linkApiResponse.ok) {
            return;
        }

        const { totalRows, rows } = await linkApiResponse.json();

        setLinks(links ? rows : () => [...rows]);
        setTotal((prev) => {
            if (prev > 0 && totalRows > prev) {
                setHasNew(true);
            }
            return totalRows;
        });

        setIsLoading(false);
    };

    const updateLink = async (shortId: string, newUrl: string) => {
        let linkPatchResponse;

        try {
            linkPatchResponse = await fetch(`/api/link/${shortId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    shortId,
                    newUrl: sanitize(newUrl),
                    field: 'url'
                })
            });
        } catch (err) {
            console.error(err);
            return Object.freeze({ error: GENERIC_ERROR_MESSAGE });
        }

        if (!linkPatchResponse.ok) {
            const patchResponseMessage = await linkPatchResponse.json();
            return Object.freeze({ error: patchResponseMessage.error });
        }

        return Object.freeze({ error: null });
    }

    const removeLink = (shortId: string) => {
        if (!links) {
            throw new Error('Unable to delete, no links exist');
        }
        return async () => {
            let removeResponse;

            try {
                removeResponse = await fetch(`/api/link/${shortId}`, {
                    method: 'DELETE'
                });
            } catch (err) {
                console.error(err);
                return Object.freeze({ success: false });
            }

            if (removeResponse && !removeResponse.ok) {
                return Object.freeze({ success: false });
            }

            if (links.length <= 1) {
                setCursor(cursor - 1);
                return Object.freeze({ success: true });
            }

            setLinks(links.filter((link) => link.shortId !== shortId));

            return Object.freeze({ success: true });
        };
    }

    const createLink = async (originalUrl: string) => {
        let shortUrlResponse;
    
        try {
            shortUrlResponse = await fetch('/api/link', {
                method: 'POST',
                body: JSON.stringify({
                    originalUrl: sanitize(originalUrl)
                })
            });
        } catch (err) {
            console.error(err);
            return Object.freeze({
                error: GENERIC_ERROR_MESSAGE
            });
        }
    
        const shortUrlData = await shortUrlResponse.json();

        if (!shortUrlResponse.ok) {
            return Object.freeze({
                error: shortUrlData.error
            });
        }

        return Object.freeze({
            shortened: shortUrlData.url
        });
    }

    const setExpiry = (shortId: string, expiry: string) => {
        return async () => {
            let expiryResponse;

            try {
                expiryResponse = await fetch(`/api/link/${shortId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        shortId,
                        expiry: sanitize(expiry),
                        field: 'expiry'
                    })
                });
            } catch (err) {
                console.error(err);
                return Object.freeze({ success: false });
            }

            if (!expiryResponse || !expiryResponse.ok) {
                return Object.freeze({ success: false });
            }
    
            return Object.freeze({ success: true });
        }
    }

    return (
        <ShortenerContext.Provider value={{ 
            links,
            total,
            cursor,
            setCursor,
            fetchAllLinks,
            createLink,
            updateLink,
            removeLink,
            setExpiry,
            hasNew,
            isLoading
        }}>
            { children }
        </ShortenerContext.Provider>
    );
};