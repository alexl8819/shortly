import { type FC } from 'react';
import { Button } from 'react-aria-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faClock } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

import { useModal } from '../contexts/ModalContext';
import { useShortener } from '../contexts/ShortenerContext';

interface TriggerProps {
    shortId: string,
    beforeActivate: () => void,
    callback: (shortId: string, hasSuccess: boolean) => void
}

export const ModalDeleteTrigger: FC<TriggerProps> = ({ shortId, beforeActivate, callback }) => {
    const { 
        isOpened, 
        openModal, 
        setSelectedItem, 
        setExecuteFn,
        setCallbackFn 
    } = useModal();
    
    const { removeLink } = useShortener();

    return (
        <Button onPress={() => {
            if (!isOpened) {
                beforeActivate();
                setSelectedItem(shortId);
                setExecuteFn(() => removeLink(shortId));
                setCallbackFn(() => {
                    return function (hasSuccess: boolean) {
                        callback(shortId, hasSuccess);
                    }
                });
                openModal();
            }
        }} className='text-red'>
            <FontAwesomeIcon icon={faTrashCan} size='1x' /> Delete
        </Button>
    )
}

ModalDeleteTrigger.propTypes = {
    shortId: PropTypes.string.isRequired,
    callback: PropTypes.func.isRequired
}

export const ModalDatePickerTrigger: FC<TriggerProps> = ({ shortId, beforeActivate, callback }) => {
    const { isOpened, openModal, setSelectedItem, setCallbackFn } = useModal();

    return (
        <Button onPress={() => {
            if (!isOpened) {
                beforeActivate();
                setSelectedItem(shortId);
                setCallbackFn(() => {
                    return function (hasSuccess: boolean) {
                        callback(shortId, hasSuccess);
                    }
                });
                openModal();
            }
        }} className='text-red border px-3 py-1.5 border-red rounded-lg hover:bg-red hover:text-white'>
            <FontAwesomeIcon icon={faClock} size='1x' /> Set Expiration
        </Button>
    )
}

ModalDatePickerTrigger.propTypes = {
    shortId: PropTypes.string.isRequired,
    callback: PropTypes.func.isRequired
}