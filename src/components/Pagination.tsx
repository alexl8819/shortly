import { Button } from 'react-aria-components';
import { type FC } from 'react';
import PropTypes from 'prop-types';

interface PaginationProps {
    total: number,
    limit?: number,
    curPage: number,
    nextPage: Function
}

const VISIBLE_LIMIT = 25;

export const Pagination: FC<PaginationProps> = ({ curPage, nextPage, total, limit = 10 }) => {
    const pages = new Array(Math.ceil(total / limit)).fill(1);

    return (
        <ol className='mt-4 list-none flex flex-row justify-center items-center space-x-6 flex-wrap overflow-x-hidden w-full'>
            {
                pages && pages.length > 1 ? pages.map((_, index) => (
                    <li key={index} className={`${curPage === index ? 'font-bold' : ''} disabled:cursor-not-allowed`}>
                        <Button 
                            onPress={(_) => nextPage(index)}
                            isDisabled={curPage === index}
                        >
                            { (index + 1) }
                        </Button>
                    </li>
                )) : null
            }
        </ol>
    );
}

Pagination.propTypes = {
    curPage: PropTypes.number.isRequired,
    nextPage: PropTypes.func.isRequired,
    total: PropTypes.number.isRequired,
    limit: PropTypes.number
};

export default Pagination;