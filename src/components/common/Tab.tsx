import styled from 'styled-components';

interface TabItem {
    id: string;
    label: string;
}

interface TabProps {
    items: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const TabContainer = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
`;

const TabButton = styled.button<{ isActive: boolean }>`
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: ${({ isActive }) => (isActive ? '#ffffff' : '#F4F4F4')};
    color: ${({ isActive }) => (isActive ? '#000000' : '#212529')};
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${({ isActive }) =>
            isActive ? '#ffffff' : '#e9ecef'};
    }
`;

export const Tab = ({ items, activeTab, onTabChange }: TabProps) => {
    return (
        <TabContainer>
            {items.map((item) => (
                <TabButton
                    key={item.id}
                    isActive={activeTab === item.id}
                    onClick={() => onTabChange(item.id)}
                >
                    {item.label}
                </TabButton>
            ))}
        </TabContainer>
    );
};
