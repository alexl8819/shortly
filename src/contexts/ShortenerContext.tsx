import { 
    createContext, 
    useContext, 
    useState, 
    useEffect,
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

        const serializedBody = new URLSearchParams();
        serializedBody.append('shortId', shortId);
        serializedBody.append('new', newUrl);

        try {
            linkPatchResponse = await fetch(`/api/link/${shortId}`, {
                method: 'PATCH',
                body: serializedBody
            });
        } catch (err) {
            console.error(err);
            return Object.freeze({ error: true });
        }

        if (!linkPatchResponse || !linkPatchResponse.ok) {
            return Object.freeze({ error: true });
        }

        return Object.freeze({});
    }

    const removeLink = (shortId: string) => {
        if (!links) {
            throw new Error('Unable to delete, no links exist');
        }
        return async () => {
            let removeResponse;

            try {
                removeResponse = await fetch(`/api/link/${shortId}`, {
                    method: 'delete'
                });
            } catch (err) {
                console.error(err);
                return null;
            }

            if (removeResponse && !removeResponse.ok) {
                return null;
            }

            if (links.length <= 1) {
                setCursor(cursor - 1);
                return;
            }

            setLinks(links.filter((link) => link.shortId !== shortId));
        };
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
            hasNew,
            isLoading
        }}>
            { children }
        </ShortenerContext.Provider>
    );
};