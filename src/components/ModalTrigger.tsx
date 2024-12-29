import { type FC } from 'react';
import { Button } from 'react-aria-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faClock } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

import { useModal } from '../contexts/ModalContext';
import { useShortener } from '../contexts/ShortenerContext';

interface ModalDeleteTriggerProps {
    shortId: string,
    callback: Function
}

export const ModalDeleteTrigger: FC<ModalDeleteTriggerProps> = ({ shortId, callback }) => {
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

interface ModalDatePickerTriggerProps {
    shortId: string,
    callback: Function
}

export const ModalDatePickerTrigger: FC<ModalDatePickerTriggerProps> = ({ shortId, callback }) => {
    const { isOpened, openModal, setSelectedItem, setCallbackFn } = useModal();

    return (
        <Button onPress={() => {
            if (!isOpened) {
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