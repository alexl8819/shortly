import { 
    createContext, 
    useContext, 
    useState, 
    type FC 
} from 'react';
import dayjs, { type ManipulateType } from 'dayjs';

import { QUERY_LIMIT } from '../lib/constants';

export interface AnalyticsDataPoint {
    shortId: string,
    originalUrl: string,
    createdAt?: Date,
    referer?: string | null,
    geolocation?: {
        ipAddress: string,
        fingerprint?: string | null,
        country?: string | null,
        state?: string | null,
        city?: string | null
    },
    devices?: {
        type: string | null,
        model?: string | null,
        vendor?: string | null,
        version?: string | null,
        interface?: string | null,
        isAutomated: boolean
    }
}

enum FilterType {
    UniqueVistors = '1',
    Bots = '2'
}

const AnalyticsContext = createContext<{
    analyticDataPoints: Array<AnalyticsDataPoint> | null,
    total: number,
    uniqueVistors: number,
    automatedVistors: number,
    dateRanges: Array<string> | undefined,
    originalUrl: string,
    setOriginalUrl: Function,
    cursor: number,
    setCursor: Function,
    fetchAllAnalytics: Function,
    isLoading: boolean
}>({
    analyticDataPoints: [],
    total: 0,
    cursor: 0,
    uniqueVistors: 0,
    automatedVistors: 0,
    originalUrl: '',
    setOriginalUrl: () => {},
    dateRanges: [],
    setCursor: () => {},
    fetchAllAnalytics: () => {},
    isLoading: false
});

export const useAnalytics = () => useContext(AnalyticsContext);

export const AnalyticsProvider: FC<any> = ({ children }) => {
    const [cursor, setCursor] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [analyticDataPoints, setAnalyticDataPoints] = useState<Array<AnalyticsDataPoint> | null>(null);
    const [uniqueVistors, setUniqueVistors] = useState<number>(0);
    const [automatedVistors, setAutomatedVistors] = useState<number>(0);
    const [originalUrl, setOriginalUrl] = useState<string>('');
    const [dateRanges, setDateRanges] = useState<Array<string>>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const getOffset = (page: number, limit: number = QUERY_LIMIT) => page * limit;

    const fetchAllAnalytics = async (id: number) => {
        setIsLoading(true);

        let analyticsResponse;
    
        try {
            analyticsResponse = await fetch(`/api/analytics/${id}?offset=${getOffset(cursor)}`);
        } catch (err) {
            console.error(err);
            return;
        }
    
        if (analyticsResponse && !analyticsResponse.ok) {
            console.info(analyticsResponse.statusText);
            return;
        }
    
        const { total: totalRows, rows } = await analyticsResponse.json();

        setAnalyticDataPoints(analyticDataPoints ? rows : (_) => [...rows]);
        setTotal(totalRows);
        setOriginalUrl(rows[0].originalUrl);
        
        if (totalRows > 0) {
            // Only generate statistics on actual data
            const uniqueVistors = _applyFilter(FilterType.UniqueVistors, rows);
            setUniqueVistors(uniqueVistors?.result || 0);
            const automatedVistors = _applyFilter(FilterType.Bots, rows);
            setAutomatedVistors(automatedVistors?.result || 0);
            // Generate date ranges from gathered data collection
            const calculateDateRanges = _generateDateRange(rows);
            setDateRanges(calculateDateRanges);
        }

        setIsLoading(false);
    };

    return (
        <AnalyticsContext.Provider value={{ 
            analyticDataPoints,
            total,
            cursor,
            uniqueVistors,
            automatedVistors,
            dateRanges,
            originalUrl,
            setOriginalUrl,
            setCursor,
            fetchAllAnalytics,
            isLoading
        }}>
            { children }
        </AnalyticsContext.Provider>
    );
};

function _applyFilter (filter: FilterType, data: Array<AnalyticsDataPoint>) {
    if (filter === FilterType.UniqueVistors) {
        return Object.freeze({ result: new Set(data.map(({ geolocation }) => geolocation?.ipAddress)).size });
    } else if (filter === FilterType.Bots) {
        return Object.freeze({ result: data.filter(({ devices }) => devices?.isAutomated ).length });
    }
    return null;
}

function _generateDateRange (dataCollection: Array<AnalyticsDataPoint>, tz: string = Intl.DateTimeFormat().resolvedOptions().timeZone) {
    let startDate = null;
    let endDate = dayjs().tz(tz);

    for (const { createdAt } of dataCollection.values()) {
        const curDate = dayjs(createdAt);

        if (!startDate || (startDate && curDate.isBefore(startDate))) {
            startDate = curDate;
        }
    }

    if (!startDate) {
        throw new Error('Could not find start date');
    }

    startDate = startDate.tz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    const daysDiff = Math.ceil(endDate.diff(startDate, 'days', true));
    let displayUnit = '';
    
    if (daysDiff <= 30) {
        displayUnit = 'day';
    } else if (daysDiff >= 30 && daysDiff <= 365) {
        displayUnit = 'month';
    } else if (daysDiff > 365) {
        displayUnit = 'year';
    }

    return Array.from({ length: daysDiff }, (_, index) => startDate.add(index, displayUnit as ManipulateType))
        .map((date) => date.format('YYYY-MM-DD'));
}