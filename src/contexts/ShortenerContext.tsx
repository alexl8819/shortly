import { 
    createContext, 
    useContext, 
    useState,
    type FC 
} from 'react';

import { QUERY_LIMIT } from '../lib/constants';

const ShortenerContext = createContext<{
    links: Array<any> | null,
    total: number,
    cursor: number,
    setCursor: Function,
    fetchAllLinks: Function,
    updateLink: Function,
    removeLink: Function,
    setExpiry: Function,
    hasNew: boolean,
    isLoading: boolean
}>({
    links: [],
    total: 0,
    cursor: 0,
    setCursor: () => {},
    fetchAllLinks: () => {},
    updateLink: () => {},
    removeLink: () => {},
    setExpiry: () => {},
    hasNew: false,
    isLoading: false
});

export const useShortener = () => useContext(ShortenerContext);

export const ShortenerProvider: FC<any> = ({ children }) => {
    const [cursor, setCursor] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [links, setLinks] = useState<Array<any> | null>(null);
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

        setLinks(links ? rows : (_) => [...rows]);
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
                    newUrl,
                    field: 'url'
                })
            });
        } catch (err) {
            console.error(err);
            return Object.freeze({ success: false });
        }

        if (!linkPatchResponse || !linkPatchResponse.ok) {
            return Object.freeze({ success: false });
        }

        return Object.freeze({ success: true });
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

    const setExpiry = (shortId: string, expiry: string) => {
        return async () => {
            let expiryResponse;

            try {
                expiryResponse = await fetch(`/api/link/${shortId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        shortId,
                        expiry,
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