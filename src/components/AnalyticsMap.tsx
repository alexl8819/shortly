import { useState, useEffect, useRef, type FC } from 'react';
import { Button, Link } from 'react-aria-components';
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
import * as utcPlugin from 'dayjs/plugin/utc';
import * as timezonePlugin from 'dayjs/plugin/timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faCaretDown, 
    faRobot, 
    faMobile, 
    faDesktop,
    faPenToSquare
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import PropTypes from 'prop-types';

import Pagination from './Pagination';
import LinkEditor from './LinkEditor';

import 'react-toastify/dist/ReactToastify.css';

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

ChartJS.defaults.scale.grid.display = false;

dayjs.extend(utcPlugin.default);
dayjs.extend(timezonePlugin.default);

interface AnalyticsMapProps {
    id: string | undefined
}

interface AnalyticsDataPoint {
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
    const [originalUrl, setOriginalUrl] = useState<string>('');
    const [totalVistors, setTotalVistors] = useState<number>(0);
    const [uniqueVistors, setUniqueVistors] = useState<number>(0);
    const [automatedVistors, setAutomatedVistors] = useState<number>(0);
    const [dateRanges, setDateRanges] = useState<Array<string>>();
    const [isEditMode, setEditMode] = useState<boolean>(false);

    const chartRef = useRef(null);

    const collectAssociated = async (id: string) => {
        let analyticsResponse;

        if (isNaN(parseInt(id))) {
            window.location.href = '/dashboard';
            return null;
        }
    
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
        setOriginalUrl(analyticsData.rows[0].originalUrl);
        setTotalVistors(analyticsData.total);
        // Only generate statistics on actual data
        if (analyticsData.total > 0) {
            const uniqueVistors = _applyFilter(FilterType.UniqueVistors, analyticsData.rows);
            setUniqueVistors(uniqueVistors?.result || 0);
            const automatedVistors = _applyFilter(FilterType.Bots, analyticsData.rows);
            setAutomatedVistors(automatedVistors?.result || 0);
            // Generate date ranges from gathered data collection
            const calculateDateRanges = _generateDateRange(analyticsData.rows);
            setDateRanges(calculateDateRanges);
        }
    }
    
    useEffect(() => {
        if (!id) {
            return;
        }

        const handleResize = () => {
            if (chartRef.current) {
                (chartRef.current as ChartJS).resize();
            }
        };
        
        collectAssociated(id);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // TODO: loading skeleton
    if (!collected) {
        return null;
    }

    return (
        <>
            <div className="mb-8 flex flex-row justify-start items-center space-x-4 w-full">
			    <Link className="hover:text-gray" href="/dashboard">Dashboard</Link>
			    <span>{'>'}</span>
			    <strong className="font-bold">{ collected[0].shortId }</strong>
		    </div>
            <div className='my-4 flex flex-col'>
                { collected.length && dateRanges ? (<div className='flex flex-row justify-evenly items-center bg-white space-x-2 w-full'>
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
                </div>) : null
                }
                <div className='my-8 flex flex-row justify-center items-center text-center w-full'>
                    {
                      isEditMode ? (<LinkEditor url={originalUrl} shortId={collected[0].shortId} onSuccess={(nUrl: string) => {
                        toast.success(`Successfully updated url to ${nUrl}`);
                        setOriginalUrl(nUrl);
                        setEditMode(false);
                    }} />) : (
                            <>
                                <Link className='text-sm font-bold underline underline-offset-2' href={originalUrl}>{ originalUrl }</Link>
                                <Button onPress={() => setEditMode(true)} className='lg:ml-3 ml-1'>
                                    <FontAwesomeIcon icon={faPenToSquare} size='1x' />
                                </Button>
                            </>
                        )
                    }
                </div>
                
                <div className='mt-4'>
                    {
                        collected.length && dateRanges ? <Line ref={chartRef} options={options} data={
                            {
                                labels: dateRanges,
                                datasets: [
                                    {
                                        fill: true,
                                        label: 'Clicks',
                                        data: _intersectDates(dateRanges, collected),
                                        borderColor: 'rgb(53, 162, 235)',
                                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                                    },
                                ],
                            }
                        } /> : (
                            <div className='my-12 flex flex-col'>
                                <FontAwesomeIcon icon={faUsers} size='8x' style={{ color: 'hsl(257, 7%, 63%)' }} />
                                <h2 className='text-center font-bold text-[3.5rem] text-very-dark-violet'>No visitors found</h2>
                            </div>
                        )
                    }
                </div>
                <ul className='mt-4 list-none space-y-4 w-full'>
                    {
                        totalVistors >  0 ? collected.reverse().map(({ createdAt, geolocation, devices, referer }, index) => (
                            <li key={index} className='p-4 mb-4 last:mb-0 hover:bg-gray bg-opacity-20 w-full'>
                                <div className='flex flex-col justify-start items-start w-full'>
                                    <p className='text-sm'>
                                        { 
                                            dayjs(createdAt).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('MM/DD/YYYY - hh:MM A') 
                                        }
                                    </p>
                                    <div className='my-4 flex lg:flex-row flex-col lg:justify-between justify-center w-full'>
                                        <div className={`${referer ? 'text-very-dark-blue' : 'text-gray'} text-sm`}>Referer: { referer || 'Unknown'}</div>
                                        <div className='text-sm underline underline-offset-4'>
                                            { [geolocation?.city, geolocation?.state, geolocation?.country].filter((d) => d).join(', ') }
                                        </div>
                                    </div>
                                    <div className='text-sm text-very-dark-violet'>
                                        { 
                                            devices?.type ? devices.isAutomated ? (<FontAwesomeIcon icon={faRobot} size='1x' />) : (<FontAwesomeIcon icon={ devices.type === 'mobile' ? faMobile : faDesktop } size='1x' />) : null } Accessed using <strong className='font-bold'>{ devices?.type === 'mobile' ? devices.model : devices?.type } { devices?.version }</strong> { devices?.interface ? ` from ${devices.interface}` : '' 
                                        }
                                    </div>
                                    <div className='flex flex-row justify-end items-center w-full'>
                                        <Button onPress={() => {}}>
                                            <FontAwesomeIcon icon={faCaretDown} size='1x' />
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        )) : null
                    }
                </ul>
                <Pagination total={collected.length} curPage={0} nextPage={() => {}} />
                <ToastContainer />
            </div>
        </>
    );
};

AnalyticsMap.propTypes = {
    id: PropTypes.string.isRequired
}

export default AnalyticsMap;

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

    // console.log(daysDiff);
    return Array.from({ length: daysDiff }, (_, index) => startDate.add(index, displayUnit as ManipulateType))
        .map((date) => date.format('YYYY-MM-DD'));
}

function _intersectDates (dateRanges: Array<string>, dataCollection: Array<AnalyticsDataPoint>) {
    const data: number[] = Array.from({ length: dateRanges.length });
    data.fill(0);

    for (const { createdAt } of dataCollection) {
        const index = dateRanges.indexOf(dayjs(createdAt).format('YYYY-MM-DD'));
        
        if (index > -1) {
            data[index] += 1;
        }
    }

    return data;
}