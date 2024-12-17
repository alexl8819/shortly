import { type FC } from 'react';
import { Button } from 'react-aria-components';
import { useModal } from '../contexts/ModalContext';
import PropTypes from 'prop-types';

interface ConfirmModalProps {
    title: string,
    content: string
}

export const ConfirmModal: FC<ConfirmModalProps> = ({ title, content }) => {
    const { isOpened, closeModal, selectedItem } = useModal();

    if (!isOpened) {
        return null;
    }

    return (
        <div className='fixed inset-0 bg-gray-800 bg-opacity-50 z-50'>
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                    <h2 className="text-xl font-bold mb-4">{ title } </h2>
                    <p className="mb-4">{ content }: <strong className='font-bold'>{ selectedItem }</strong></p>
                    <div className="flex justify-end items-center">
                        <Button onPress={() => closeModal(true)} className="px-4 py-2 text-very-dark-violet">
                            Yes
                        </Button>
                        <Button onPress={() => closeModal()} className="px-4 py-2 bg-red text-white rounded-md">
                            No
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

ConfirmModal.propTypes = {
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
}

export default ConfirmModal;