import { useEffect, useState, useTransition } from 'react';
import styled from 'styled-components';
import { JSONViewer, PDFViewer, Preview, Tab } from '@/components';
import {
    HighlightProvider,
    PaginationProvider,
    TabProvider,
    useTab,
} from '@/contexts';
import { GlobalStyle } from '@/styles';
import { DoclingDocument } from '@/types';
import { loadJSON } from '@/utils';

const AppContainer = styled.div`
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
`;

const PDFContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 50%;
    height: 100%;
    padding: 20px;
    background-color: #f5f5f5;
    overflow: auto;
`;

const ContentContainer = styled.div`
    width: 50%;
    height: 100%;
    padding: 20px;
    background-color: #f5f5f5;
    overflow: auto;
    border-left: 1px solid #e0e0e0;
`;

const ContentWrapper = styled.div`
    height: calc(100% - 60px);
    overflow: auto;
`;

const HomePage = () => {
    const [, startTransition] = useTransition();
    const { activeTab, setActiveTab, tabItems } = useTab();
    const [jsonData, setJsonData] = useState<DoclingDocument | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadJSON({
            url: '/1.report.json',
            successCallback: (data: DoclingDocument) => {
                setJsonData(data);
            },
            errorCallback: (error: Error) => {
                setError(error.message);
            },
        });
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!jsonData) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <GlobalStyle />
            <AppContainer>
                <PDFContainer>
                    <PDFViewer
                        url="/1.report.pdf"
                        jsonData={jsonData}
                        pageWidth={jsonData?.pages?.['1']?.size?.width}
                        pageHeight={jsonData?.pages?.['1']?.size?.height}
                    />
                </PDFContainer>
                <ContentContainer>
                    <Tab
                        items={tabItems}
                        activeTab={activeTab}
                        onTabChange={(tabId) => {
                            startTransition(() => {
                                setActiveTab(tabId as 'preview' | 'json');
                            });
                        }}
                    />
                    <ContentWrapper>
                        {activeTab === 'preview' ? (
                            <Preview data={jsonData} />
                        ) : (
                            <JSONViewer data={jsonData} />
                        )}
                    </ContentWrapper>
                </ContentContainer>
            </AppContainer>
        </>
    );
};

const AppWithProviders = () => {
    return (
        <TabProvider>
            <PaginationProvider>
                <HighlightProvider>
                    <HomePage />
                </HighlightProvider>
            </PaginationProvider>
        </TabProvider>
    );
};
export default AppWithProviders;
