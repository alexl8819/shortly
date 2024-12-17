import { type FC } from 'react';
import { Button } from 'react-aria-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

import { useModal } from '../contexts/ModalContext';
import { useShortener } from '../contexts/ShortenerContext';

interface ModalTrigger {
    shortId: string
}

export const ModalTrigger: FC<ModalTrigger> = ({ shortId }) => {
    const { isOpened, openModal, setSelectedItem, setExecuteFn } = useModal();
    const { removeLink } = useShortener();
    
    return (
        <Button onPress={() => {
            if (!isOpened) {
                setSelectedItem(shortId);
                setExecuteFn(() => removeLink(shortId));
                openModal();
            }
        }} className='text-red'>
            <FontAwesomeIcon icon={faTrashCan} size='1x' /> Delete
        </Button>
    )
}

ModalTrigger.propTypes = {
    shortId: PropTypes.string.isRequired
}

export default ModalTrigger;