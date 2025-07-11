import { useEffect, useRef, useState, type FC } from 'react';
import Flatpickr from 'react-flatpickr';
import dayjs from 'dayjs';
import { Button } from 'react-aria-components';
import PropTypes from 'prop-types';

import { useShortener } from '../../contexts/ShortenerContext';
import { useModal } from '../../contexts/ModalContext';
import { DATETIME_PICKER_OPTIONS, MINIMUM_DATETIME } from '../../lib/constants';

import 'flatpickr/dist/themes/material_blue.css';

interface ChooseDateModalProps {
    title: string,
    date: Date
}

const ChooseDateModal: FC<ChooseDateModalProps> = ({ title, date }) => {
    const [ready, setReady] = useState<boolean>(false);
    const flatpickrRef = useRef(null);
    
    const { isOpened, closeModal, selectedItem, setExecuteFn } = useModal();
    const { setExpiry } = useShortener();

    const handleDatetimeChange = (_: Array<Date>, dateStr: string) => {
        setReady(true);

        setExecuteFn(() => setExpiry(selectedItem, dayjs(dateStr).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).toISOString()));
    };

    const handleCancel = () => {
        setReady(false);

        closeModal(false);
    }

    useEffect(() => {
        return () => {
            if (flatpickrRef.current !== null) {
                const fp = (flatpickrRef.current as Flatpickr);
                fp.flatpickr.close();
                fp.flatpickr.destroy();
            }
        }
    }, []);

    if (!isOpened) {
        return null;
    }

    return (
        <div className='fixed inset-0 bg-gray bg-opacity-50 z-50'>
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-white border border-gray p-8 rounded-lg shadow-2xl max-w-sm w-full">
                    <h2 className='text-xl font-bold mb-4'>{ title }</h2>
                    <div className="mb-4">
                        <Flatpickr 
                            ref={flatpickrRef} 
                            data-enable-time 
                            options={Object.assign({}, DATETIME_PICKER_OPTIONS, { minDate: MINIMUM_DATETIME })} 
                            defaultValue={date.toISOString()} 
                            onChange={handleDatetimeChange}
                            className='hidden'
                        />
                    </div>
                    <div className="flex justify-end items-center">
                        <Button onPress={() => closeModal(true)} className="px-4 py-2 text-very-dark-violet disabled:text-gray disabled:cursor-not-allowed" isDisabled={!ready}>
                            Finish
                        </Button>
                        <Button onPress={handleCancel} className="px-4 py-2 bg-red text-white rounded-md">
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
};

ChooseDateModal.propTypes = {
    title: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(Date).isRequired
};

export default ChooseDateModal;