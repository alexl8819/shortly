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
    setExecuteFn: Function
}>({
    isOpened: false,
    openModal: () => {},
    closeModal: () => {},
    selectedItem: '',
    setSelectedItem: () => {},
    setExecuteFn: () => {}
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider: FC<any> = ({ children }) => {
    const [isOpened, setOpened] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [callFn, setCallFn] = useState<Function>();

    return (
        <ModalContext.Provider value={{ 
            isOpened,
            openModal: () => setOpened(true),
            closeModal: async (executeFn: boolean) => {
                setOpened(false);
                if (executeFn && typeof callFn === 'function') {
                    await callFn();
                }
            },
            selectedItem,
            setSelectedItem,
            setExecuteFn: setCallFn 
        }}>
            { children }
        </ModalContext.Provider>
    );
};