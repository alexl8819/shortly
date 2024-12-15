import { useState, useEffect, type FC } from 'react';
import { Link } from 'react-aria-components';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
  } from 'chart.js';
  import { Line } from 'react-chartjs-2';
  import dayjs, { type ManipulateType } from 'dayjs';

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
  );

interface AnalyticsMapProps {
    id: string
}

interface AnalyticsDataPoint {
    createdAt: Date,
    referer: string | null,
    links: {
        id: number,
        shortId: string,
        originalUrl: string
    },
    geolocation: {
        ipAddress: string,
        fingerprint?: string | null,
        country?: string | null,
        state?: string | null,
        city?: string | null
    },
    devices: {
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

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'bottom' as const,
        },
        title: {
            display: false,
        }
    },
};

export const AnalyticsMap: FC<AnalyticsMapProps> = ({ id }) => {
    const [collected, setCollected] = useState<Array<AnalyticsDataPoint>>();
    const [totalVistors, setTotalVistors] = useState<number>(0);
    const [uniqueVistors, setUniqueVistors] = useState<number>(0);
    const [automatedVistors, setAutomatedVistors] = useState<number>(0);
    const [dateRanges, setDateRanges] = useState<Array<string>>();

    const collectAssociated = async (id: string) => {
        let analyticsResponse;
    
        try {
            analyticsResponse = await fetch(`/api/analytics/${id}`);
        } catch (err) {
            console.error(err);
            return null;
        }
    
        if (analyticsResponse && !analyticsResponse.ok) {
            console.log(analyticsResponse.statusText);
            return null;
        }
    
        const analyticsData = await analyticsResponse.json();
        setCollected(analyticsData.rows);
        setTotalVistors(analyticsData.total);
        const uniqueVistors = applyFilter(FilterType.UniqueVistors, analyticsData.rows);
        setUniqueVistors(uniqueVistors?.result || 0);
        const automatedVistors = applyFilter(FilterType.Bots, analyticsData.rows);
        setAutomatedVistors(automatedVistors?.result || 0);
        if (analyticsData.rows.length) {
            const calculateDateRanges = generateDateRange(analyticsData.rows);
            setDateRanges(calculateDateRanges);
        }
    }
    
    useEffect(() => {
        collectAssociated(id);
    }, []);

    if (!collected) {
        return null;
    }

    return (
        <>
            <div className="mb-6 flex flex-row justify-start items-center space-x-6 w-full">
			    <Link className="hover:text-gray" href="/dashboard">Dashboard</Link>
			    <span>{'>'}</span>
			    <strong className="font-bold">{ collected[0].links.shortId }</strong>
		    </div>
            <div className='flex flex-col'>
                <div className='flex flex-row justify-evenly items-center bg-white space-x-2 w-full'>
                    <div className='text-center'>
                        <div className='font-bold text-[4rem]'>{ uniqueVistors }</div>
                        <h3 className='text-very-dark-violet text-xl'>Unique Vistors</h3>
                    </div>
                    <div className='text-center'>
                        <div className='font-bold text-[4rem]'>{ totalVistors }</div>
                        <h3 className='text-very-dark-violet text-xl'>Total Vistors</h3>
                    </div>
                    <div className='text-center'>
                        <div className='font-bold text-[4rem]'>{ automatedVistors }</div>
                        <h3 className='text-very-dark-violet text-xl'>Automated Vistors</h3>
                    </div>
                </div>
                <div className='mt-4'>
                    {
                        collected.length && dateRanges ? <Line options={options} data={
                            {
                                labels: dateRanges,
                                datasets: [
                                    {
                                        fill: true,
                                        label: 'Clicks',
                                        data: intersectDates(dateRanges, collected),
                                        borderColor: 'rgb(53, 162, 235)',
                                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                                    },
                                ],
                            }
                        } /> : <h2 className='my-4 text-center font-bold text-[3.5rem] text-grayish-violet'>No visitors found</h2>
                    }
                </div>
                <ul className='mt-4 list-none space-y-4'>
                    {
                        collected.map(({ geolocation, devices }, index) => (
                            <li key={index} className='px-2 divide-y-2'>

                            </li>
                        ))
                    }
                </ul>
            </div>
        </>
    );
};

export default AnalyticsMap;

function applyFilter (filter: FilterType, data: Array<AnalyticsDataPoint>) {
    if (filter === FilterType.UniqueVistors) {
        let unique = 0;
        let last = '';
        for (const { geolocation } of data.values()) {
            if (geolocation.ipAddress !== last) {
                unique += unique + 1;
            }
            last = geolocation.ipAddress;
        }
        return Object.freeze({ result: unique });
    } else if (filter === FilterType.Bots) {
        let botsFound = 0;
        for (const { devices } of data.values()) {
            if (devices.isAutomated) {
                botsFound += botsFound + 1;
            }
        }
        return Object.freeze({ result: botsFound });
    }
    return null;
}

function generateDateRange (dataCollection: Array<AnalyticsDataPoint>) {
    let startDate = null;
    let endDate = null;

    for (const { createdAt } of dataCollection.values()) {
        const curDate = dayjs(createdAt);

        if (!startDate) { 
            startDate = curDate;
        } else if (startDate && curDate.isBefore(startDate)) {
            endDate = startDate;
            startDate = curDate;
        } else if (startDate && curDate.isAfter(startDate)) {
            endDate = curDate;
        }
    }

    if (!startDate) {
        throw new Error('Could not find start date');
    }

    // console.log(startDate);
    // console.log(endDate);
    
    const daysDiff = endDate ? dayjs(endDate).diff(startDate, 'days') : 0;
    let displayUnit = '';
    
    if (daysDiff <= 30) {
        displayUnit = 'day';
    } else if (daysDiff >= 30 && daysDiff <= 365) {
        displayUnit = 'month';
    } else if (daysDiff > 365) {
        displayUnit = 'year';
    }

    // console.log(daysDiff);
    return Array.from({ length: 7 }, (_, index) => startDate.add(index, displayUnit as ManipulateType))
        .map((date) => date.format('YYYY-MM-DD'));
}

function intersectDates (dateRanges: Array<string>, dataCollection: Array<AnalyticsDataPoint>) {
    const data: number[] = Array.from({ length: 7 });
    data.fill(0);

    for (const { createdAt } of dataCollection) {
        const index = dateRanges.indexOf(dayjs(createdAt).format('YYYY-MM-DD'));
        
        if (index > -1) {
            data[index] += 1;
        }
    }

    return data;
}