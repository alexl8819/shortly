import { type FC } from 'react';
import { Button } from 'react-aria-components';
import PropTypes from 'prop-types';

import { useModal } from '../../contexts/ModalContext';

interface ConfirmModalProps {
    title: string,
    content: string
}

const ConfirmModal: FC<ConfirmModalProps> = ({ title, content }) => {
    const { isOpened, closeModal, selectedItem } = useModal();

    if (!isOpened) {
        return null;
    }

    return (
        <div className='fixed inset-0 bg-gray bg-opacity-50 z-50'>
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-white border border-gray p-8 rounded-lg shadow-2xl max-w-sm w-full">
                    <h2 className="text-xl font-bold mb-4">{ title } </h2>
                    <p className="mb-4">{ content }: <strong className='font-bold'>{ selectedItem }</strong></p>
                    <div className="flex justify-end items-center">
                        <Button onPress={() => closeModal(true)} className="px-4 py-2 text-very-dark-violet">
                            Yes
                        </Button>
                        <Button onPress={() => closeModal(false)} className="px-4 py-2 bg-red text-white rounded-md">
                            No
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
};

ConfirmModal.propTypes = {
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
};

export default ConfirmModal;
