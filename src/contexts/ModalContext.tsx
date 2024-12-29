import { 
    createContext, 
    useContext, 
    useState,
    type FC 
} from 'react';

const ModalContext = createContext<{
    isOpened: boolean,
    openModal: Function,
    closeModal: Function,
    selectedItem: string,
    setSelectedItem: Function,
    setExecuteFn: Function,
    setCallbackFn: Function
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

export const ModalProvider: FC<any> = ({ children }) => {
    const [isOpened, setOpened] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [callFn, setCallFn] = useState<Function>();
    const [finishFn, setFinishFn] = useState<Function>();

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