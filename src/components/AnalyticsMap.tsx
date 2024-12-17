import { useState, useEffect, type FC } from 'react';
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
import PropTypes from 'prop-types';

import Pagination from './Pagination';

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

dayjs.extend(utcPlugin.default);
dayjs.extend(timezonePlugin.default);

interface AnalyticsMapProps {
    id: string | undefined
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
    const [isEditMode, setEditMode] = useState<boolean>(false);

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
        setTotalVistors(analyticsData.total);
        const uniqueVistors = _applyFilter(FilterType.UniqueVistors, analyticsData.rows);
        setUniqueVistors(uniqueVistors?.result || 0);
        const automatedVistors = _applyFilter(FilterType.Bots, analyticsData.rows);
        setAutomatedVistors(automatedVistors?.result || 0);
        // Generate date ranges from gathered data collection
        if (analyticsData.rows.length) {
            const calculateDateRanges = _generateDateRange(analyticsData.rows);
            setDateRanges(calculateDateRanges);
        }
    }
    
    useEffect(() => {
        if (!id) {
            return;
        }
        collectAssociated(id);
    }, []);

    if (!collected) {
        return null;
    }

    return (
        <>
            <div className="mb-8 flex flex-row justify-start items-center space-x-6 w-full">
			    <Link className="hover:text-gray" href="/dashboard">Dashboard</Link>
			    <span>{'>'}</span>
			    <strong className="font-bold">{ collected.length ? collected[0].links.shortId : 'No Vistors Found' }</strong>
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
                { 
                    collected.length && !isEditMode ? 
                    (
                        <div className='my-8 flex flex-row justify-center items-center text-center w-full'>
                            <Link className='text-sm font-bold underline underline-offset-2' href={collected[0].links.originalUrl}>{ collected[0].links.originalUrl }</Link>
                            <Button onPress={() => setEditMode(true)} className='lg:ml-3 ml-1'>
                                <FontAwesomeIcon icon={faPenToSquare} size='1x' />
                            </Button>
                        </div>
                    ) : (
                        isEditMode && collected.length ?
                        (
                            <></>
                        ) : null
                    )
                }
                <div className='mt-4'>
                    {
                        collected.length && dateRanges ? <Line options={options} data={
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
                                <h2 className='text-center font-bold text-[3.5rem] text-grayish-violet'>No visitors found</h2>
                            </div>
                        )
                    }
                </div>
                <ul className='mt-4 list-none space-y-4 w-full'>
                    {
                        collected.reverse().map(({ createdAt, geolocation, devices, referer }, index) => (
                            <li key={index} className='p-4 mb-4 last:mb-0 hover:bg-gray bg-opacity-20 w-full'>
                                <div className='flex flex-col justify-start items-start w-full'>
                                    <p className='text-sm'>
                                        { 
                                            dayjs(createdAt).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('MM/DD/YYYY - hh:MM A') 
                                        }
                                    </p>
                                    <div className='my-4 flex flex-row justify-between w-full'>
                                        <div className={`${referer ? 'text-very-dark-blue' : 'text-gray'} text-sm`}>Referer: { referer || 'Unknown'}</div>
                                        <div className='text-sm underline underline-offset-4'>
                                            { [geolocation.city, geolocation.state, geolocation.country].filter((d) => d).join(', ') }
                                        </div>
                                    </div>
                                    <div className='text-sm text-very-dark-violet'>
                                        { 
                                            devices.type ? devices.isAutomated ? (<FontAwesomeIcon icon={faRobot} size='1x' />) : (<FontAwesomeIcon icon={ devices.type === 'mobile' ? faMobile : faDesktop } size='1x' />) : null } Accessed using <strong className='font-bold'>{ devices.type === 'mobile' ? devices.model : devices.type } { devices.version }</strong> { devices.interface ? ` from ${devices.interface}` : '' 
                                        }
                                    </div>
                                    <div className='flex flex-row justify-end items-center w-full'>
                                        <Button onPress={() => {}}>
                                            <FontAwesomeIcon icon={faCaretDown} size='1x' />
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))
                    }
                </ul>
                <Pagination total={collected.length} curPage={0} nextPage={() => {}} />
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
        return Object.freeze({ result: new Set(data.map(({ geolocation }) => geolocation.ipAddress)).size });
    } else if (filter === FilterType.Bots) {
        return Object.freeze({ result: data.filter(({ devices }) => devices.isAutomated ).length });
    }
    return null;
}

function _generateDateRange (dataCollection: Array<AnalyticsDataPoint>) {
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

function _intersectDates (dateRanges: Array<string>, dataCollection: Array<AnalyticsDataPoint>) {
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