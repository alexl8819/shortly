import { 
    createContext, 
    useContext, 
    useState, 
    useEffect,
    type FC 
} from 'react';

const ShortenerContext = createContext<{
    links: Array<any> | null,
    total: number,
    cursor: number,
    setCursor: Function,
    hasNew: boolean
}>({
    links: [],
    total: 0,
    cursor: 0,
    setCursor: () => {},
    hasNew: false
});

export const useShortener = () => useContext(ShortenerContext);

export const ShortenerProvider: FC<any> = ({ children }) => {
    const [cursor, setCursor] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [links, setLinks] = useState<Array<any> | null>(null);
    const [hasNew, setHasNew] = useState<boolean>(false);

    const getOffset = (page: number, limit: number = 10) => page * limit;

    const fetchAllLinks = async () => {
        setHasNew(false);

        if (cursor < 0) {
            setLinks([]);
            return;
        }

        let linkApiResponse;

        try {
            linkApiResponse = await fetch(`/api/link?index=${getOffset(cursor)}`);
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
            if (prev > 0 && prev !== totalRows) {
                setHasNew(true);
            }
            return totalRows;
        });
    };
  
    useEffect(() => {
        fetchAllLinks();
    }, [cursor]);

    return (
        <ShortenerContext.Provider value={{ 
            links,
            total,
            cursor,
            setCursor,
            hasNew
        }}>
            { children }
        </ShortenerContext.Provider>
    );
};