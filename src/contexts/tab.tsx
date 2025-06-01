import { ReactNode, createContext, useContext, useState } from 'react';

type TabType = 'preview' | 'json';

interface TabContextType {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    tabItems: { id: TabType; label: string }[];
}

const TabContext = createContext<TabContextType | null>(null);

interface TabProviderProps {
    children: ReactNode;
}

export const TabProvider = ({ children }: TabProviderProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('preview');

    const tabItems: { id: TabType; label: string }[] = [
        { id: 'preview', label: 'Preview' },
        { id: 'json', label: 'JSON' },
    ];

    return (
        <TabContext.Provider
            value={{
                activeTab,
                setActiveTab,
                tabItems,
            }}
        >
            {children}
        </TabContext.Provider>
    );
};

export const useTab = () => {
    const context = useContext(TabContext);
    if (!context) {
        throw new Error('useTab must be used within a TabProvider');
    }
    return context;
};
