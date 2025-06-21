import { usePagination } from 'pagination-react-js';
import { Button } from 'react-aria-components';
import { type FC, type PropsWithChildren } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from 'prop-types';
import { faAngleLeft, faAngleRight, faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons";

interface PaginationProps {
    total: number,
    limit: number,
    curPage: number,
    nextPage: Function
}

interface PaginationItemProps extends PropsWithChildren {
    label: string
    active?: boolean
    onPress: () => void
}

const PaginationItem: FC<PaginationItemProps> = ({ children, label, active, onPress }) => {
    return (
        <li>
            <Button
                className={`${active ? 'font-bold' : 'font-medium'}`}
                onPress={onPress}
                aria-current={active ?? "page"}
                aria-label={label}
            >
                { children }
            </Button>
        </li>
    );
}

export const Pagination: FC<PaginationProps> = ({ curPage, nextPage, total, limit }) => {
    const { pageNumbers, setActivePage } = usePagination({
        activePage: curPage,
        recordsPerPage: limit,
        totalRecordsLength: total,
        offset: 1,
        navCustomPageSteps: { prev: 2, next: 2 },
        permanentFirstNumber: true,
        permanentLastNumber: true,
    });

    return (
        <nav>
            <ol className='mt-4 list-none flex flex-row justify-center items-center space-x-6 flex-wrap overflow-x-hidden w-full'>
                <PaginationItem 
                    label={`Move to first page - ${pageNumbers.firstPage}`} 
                    onPress={() => {
                        setActivePage(pageNumbers.firstPage);
                        nextPage(pageNumbers.firstPage);
                    }
                }>
                    <FontAwesomeIcon icon={faAnglesLeft} style={{color:"grey"}} />
                </PaginationItem>

                <PaginationItem 
                    label={`Move to previous page - ${pageNumbers.previousPage}`}
                    onPress={() => {
                        if (pageNumbers.previousPage) {
                            setActivePage(pageNumbers.previousPage);
                            nextPage(pageNumbers.previousPage);
                        }
                    }
                }>
                    <FontAwesomeIcon icon={faAngleLeft} style={{color:"grey"}} />
                </PaginationItem>

                <PaginationItem
                    label={`Move to first page - ${pageNumbers.firstPage}`}
                    active={pageNumbers.firstPage === pageNumbers.activePage}
                    onPress={() => {
                        setActivePage(pageNumbers.firstPage);
                        nextPage(pageNumbers.firstPage);
                    }}
                >
                    { pageNumbers.firstPage }
                </PaginationItem>

                {
                    pageNumbers.navigation.map((navigationNumber) => {
                        return navigationNumber === pageNumbers.firstPage || navigationNumber === pageNumbers.lastPage ? null : (
                            <PaginationItem
                                label={`Move to page - ${navigationNumber}`}
                                key={navigationNumber}
                                active={navigationNumber === pageNumbers.activePage}
                                onPress={() => {
                                    setActivePage(navigationNumber);
                                    nextPage(navigationNumber);
                                }}
                            >
                                { navigationNumber }
                            </PaginationItem>
                        );
                    })
                }

                {
                    pageNumbers.firstPage !== pageNumbers.lastPage && (
                        <PaginationItem
                            label={`Move to last page - ${pageNumbers.lastPage}`}
                            active={pageNumbers.lastPage === pageNumbers.activePage}
                            onPress={() => {
                                setActivePage(pageNumbers.lastPage);
                                nextPage(pageNumbers.lastPage);
                            }}
                        >
                            { pageNumbers.lastPage}
                        </PaginationItem>
                    )
                }

                <PaginationItem label={`Move to next page - ${pageNumbers.nextPage}`} onPress={() => {
                    if (pageNumbers.nextPage) {
                        setActivePage(pageNumbers.nextPage);
                        nextPage(pageNumbers.nextPage);
                    }
                }}>
                    <FontAwesomeIcon icon={faAngleRight} style={{color:"grey"}} />
                </PaginationItem>

                <PaginationItem label={`Move to last page - ${pageNumbers.lastPage}`} onPress={() => {
                    setActivePage(pageNumbers.lastPage);
                    nextPage(pageNumbers.lastPage);
                }}>
                    <FontAwesomeIcon icon={faAnglesRight} style={{color:"grey"}} />
                </PaginationItem>
            </ol>
        </nav>
    );
}

Pagination.propTypes = {
    curPage: PropTypes.number.isRequired,
    nextPage: PropTypes.func.isRequired,
    total: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired
};

export default Pagination;