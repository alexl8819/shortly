import { useState, useEffect, useRef, type FC } from 'react';
import { Breadcrumb, Breadcrumbs, Button, Link } from 'react-aria-components';
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
import dayjs from 'dayjs';
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
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import Pagination from './Pagination';
import LinkEditor from './LinkEditor';
import { useAnalytics, type AnalyticsDataPoint } from '../contexts/AnalyticsContext';
import { CHART_OPTIONS } from '../lib/constants';
import { ChartSkeleton, GenericSkeletonItem, ListSkeleton } from './Skeleton';

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

export const AnalyticsMap: FC<AnalyticsMapProps> = ({ id }) => {
    const { 
        analyticDataPoints,
        total: totalVistors,
        uniqueVistors,
        automatedVistors,
        dateRanges,
        originalUrl,
        setOriginalUrl,
        cursor,
        setCursor,
        fetchAllAnalytics,
        isLoading 
    } = useAnalytics();

    const [isEditMode, setEditMode] = useState<boolean>(false);

    const chartRef = useRef(null);

    const handleResize = () => {
        if (chartRef.current) {
            (chartRef.current as ChartJS).resize();
        }
    };

    const handleUrlUpdate = (nUrl: string) => {
        toast.success(`Successfully updated url to ${nUrl}`);
        setOriginalUrl(nUrl);
        setEditMode(false);
    }
    
    useEffect(() => {
        if (!id) {
            return;
        }
        
        fetchAllAnalytics(id);

        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [cursor]);

    return (
        <>
            <Breadcrumbs className="mb-8 flex flex-row justify-start items-center space-x-4 w-full">
                <Breadcrumb>
                    <Link className="hover:text-gray" href='/dashboard'>Dashboard</Link>
                </Breadcrumb>
                <Breadcrumb>
                    <div className="after:content-['>']"></div>
                </Breadcrumb>
                <Breadcrumb>
                    <Link className="font-bold">{ analyticDataPoints && !isLoading ? analyticDataPoints[0].shortId : '...' }</Link>
                </Breadcrumb>
            </Breadcrumbs>
            <div className='my-4 flex flex-col'>
                <div className='flex flex-row justify-evenly items-center bg-white space-x-2 w-full'>
                    <div className='text-center'>
                        <div className='font-bold text-[4rem]'>
                            { 
                                isLoading ? (
                                    <div className='flex flex-row justify-center items-center h-16'>
                                        <GenericSkeletonItem />
                                    </div>) : uniqueVistors 
                            }
                        </div>
                        <h3 className='text-very-dark-violet text-xl'>Unique Vistors</h3>
                    </div>
                    <div className='text-center'>
                        <div className='font-bold text-[4rem]'>
                            { 
                                isLoading ? (
                                    <div className='flex flex-row justify-center items-center h-16'>
                                        <GenericSkeletonItem />
                                    </div>) : totalVistors 
                            }
                        </div>
                        <h3 className='text-very-dark-violet text-xl'>Total Vistors</h3>
                    </div>
                    <div className='text-center'>
                        <div className='font-bold text-[4rem]'>
                            {
                                isLoading ? (
                                    <div className='flex flex-row justify-center items-center h-16'>
                                        <GenericSkeletonItem />
                                    </div>) : automatedVistors 
                            }
                        </div>
                        <h3 className='text-very-dark-violet text-xl'>Automated Vistors</h3>
                    </div>
                </div>
                <div className='my-8 flex flex-row justify-center items-center text-center w-full'>
                    {    
                        isLoading ? (
                            <div className='flex flex-row justify-center h-10 w-1/3'>
                                <GenericSkeletonItem />
                            </div>) : isEditMode && analyticDataPoints ? (<LinkEditor url={originalUrl} shortId={analyticDataPoints[0].shortId} onSuccess={handleUrlUpdate} />) : (
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
                    { !isLoading && dateRanges && analyticDataPoints ? <Line ref={chartRef} options={CHART_OPTIONS} data={
                            {
                                labels: dateRanges,
                                datasets: [
                                    {
                                        fill: true,
                                        label: 'Clicks',
                                        data: _intersectDates(dateRanges, analyticDataPoints),
                                        borderColor: 'rgb(53, 162, 235)',
                                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                                    },
                                ],
                            }
                        } /> : <ChartSkeleton />
                    }
                </div>
                <ul className='mt-4 list-none space-y-4 w-full'>
                    {
                        !isLoading && totalVistors > 0 && analyticDataPoints ? analyticDataPoints.reverse().map(({ createdAt, geolocation, devices, referer }, index) => (
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
                        )) : <ListSkeleton rows={5} />
                    }
                </ul>
                <Pagination total={totalVistors} curPage={cursor} nextPage={(page: number) => setCursor(page)} />
            </div>
        </>
    );
};

AnalyticsMap.propTypes = {
    id: PropTypes.string.isRequired
}

export default AnalyticsMap;

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