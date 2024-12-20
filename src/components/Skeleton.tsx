import { type FC } from 'react';

interface TableSkeletonProps {
    cols: number,
    rows: number
}

export const TableSkeleton: FC<TableSkeletonProps> = ({ cols, rows }) => {
    return (
        <table className="mt-12 table-fixed w-full">
            <thead>
                <tr>
                    {
                        Array.from({ length: cols }).map((_, index) => (
                            <th key={index}>
                                <div className='bg-grayish-violet w-28 h-10 mb-12 mx-auto animate-pulse'></div>
                            </th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
                {
                    Array.from({ length: rows }).map((_, index) => (
                        <tr key={index}>
                            {
                                Array.from({ length: cols }).map((_, i) => (
                                    <td key={i}>
                                        <div className='bg-grayish-violet h-10 w-20 my-6 mx-auto animate-pulse'></div>
                                    </td>
                                ))
                            }
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

export const WidgetSkeleton = () => {
    return (
        <div className='flex flex-row w-full'>
            <div className='bg-grayish-violet rounded-lg h-12 w-2/3 animate-pulse'></div>
            <div className='bg-grayish-violet rounded-lg h-12 w-1/3 ml-3 animate-pulse'></div>
        </div>
    );
}