import { useState } from 'react';
import styled from 'styled-components';
import { JSONViewer, PDFViewer, Preview, Tab } from '@/components';
import { GlobalStyle } from '@/styles';

const AppContainer = styled.div`
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
`;

const PDFContainer = styled.div`
    width: 40%;
    height: 100%;
    padding: 20px;
    background-color: #f5f5f5;
    overflow: auto;
`;

const ContentContainer = styled.div`
    width: 60%;
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
    const [activeTab, setActiveTab] = useState<string>('preview');

    const tabItems = [
        { id: 'preview', label: 'Preview' },
        { id: 'json', label: 'JSON' },
    ];

    return (
        <>
            <GlobalStyle />
            <AppContainer>
                <PDFContainer>
                    <PDFViewer url="/1.report.pdf" />
                </PDFContainer>
                <ContentContainer>
                    <Tab
                        items={tabItems}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                    <ContentWrapper>
                        {activeTab === 'preview' ? (
                            <Preview url="/1.report.json" />
                        ) : (
                            <JSONViewer url="/1.report.json" />
                        )}
                    </ContentWrapper>
                </ContentContainer>
            </AppContainer>
        </>
    );
}

export default App;
