import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import styled from 'styled-components';
import { DoclingDocument } from '@/types';

interface JSONViewerProps {
    data: DoclingDocument;
}

const ViewerContainer = styled.div`
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const JSONViewer = ({ data }: JSONViewerProps) => {
    return (
        <ViewerContainer>
            <JsonView
                data={data}
                shouldExpandNode={allExpanded}
                style={defaultStyles}
            />
        </ViewerContainer>
    );
};
