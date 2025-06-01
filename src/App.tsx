import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { JSONViewer, PDFViewer, Preview, Tab } from '@/components';
import { GlobalStyle } from '@/styles';
import { DoclingDocument } from '@/types';

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

function App() {
    const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');
    const [jsonData, setJsonData] = useState<DoclingDocument | null>(null);
    const [highlightedRef, setHighlightedRef] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const tabItems = [
        { id: 'preview', label: 'Preview' },
        { id: 'json', label: 'JSON' },
    ];

    useEffect(() => {
        const loadJSON = async () => {
            try {
                const response = await fetch('/1.report.json');
                if (!response.ok) {
                    throw new Error('Failed to load JSON');
                }
                const data = await response.json();
                setJsonData(data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to load JSON',
                );
                console.error('Error loading JSON:', err);
            }
        };

        loadJSON();
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
                        onHighlightChange={setHighlightedRef}
                        pageWidth={jsonData?.pages?.['1']?.size?.width}
                        pageHeight={jsonData?.pages?.['1']?.size?.height}
                    />
                </PDFContainer>
                <ContentContainer>
                    <Tab
                        items={tabItems}
                        activeTab={activeTab}
                        onTabChange={(tabId) =>
                            setActiveTab(tabId as 'preview' | 'json')
                        }
                    />
                    <ContentWrapper>
                        {activeTab === 'preview' ? (
                            <Preview
                                data={jsonData}
                                highlightedRef={highlightedRef}
                            />
                        ) : (
                            <JSONViewer data={jsonData} />
                        )}
                    </ContentWrapper>
                </ContentContainer>
            </AppContainer>
        </>
    );
}

export default App;
