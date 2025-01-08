import { 
    createContext, 
    useContext, 
    useState,
    type FC, 
    type PropsWithChildren
} from 'react';
// import type { DelayedExecution } from './ShortenerContext';

const ModalContext = createContext<{
    isOpened: boolean,
    openModal: () => void,
    closeModal: (executeFn: boolean) => void,
    selectedItem: string,
    setSelectedItem: (item: string) => void,
    setExecuteFn: (exec: any) => void,
    setCallbackFn: (callback: () => void) => void
}>({
    isOpened: false,
    openModal: () => {},
    closeModal: () => {},
    selectedItem: '',
    setSelectedItem: () => {},
    setExecuteFn: () => {},
    setCallbackFn: () => {}
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => {
    const [isOpened, setOpened] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [callFn, setCallFn] = useState<() => { success: boolean }>();
    const [finishFn, setFinishFn] = useState<(success: boolean) => void>();

    return (
        <ModalContext.Provider value={{ 
            isOpened,
            openModal: () => setOpened(true),
            closeModal: async (executeFn: boolean) => {
                setOpened(false);

                if (executeFn && typeof callFn === 'function') {
                    const { success } = await callFn();
                    
                    if (finishFn && typeof finishFn === 'function') {
                        finishFn(success);
                    }
                }
            },
            selectedItem,
            setSelectedItem,
            setExecuteFn: setCallFn,
            setCallbackFn: setFinishFn
        }}>
            { children }
        </ModalContext.Provider>
    );
};