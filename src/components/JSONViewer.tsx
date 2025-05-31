import { useEffect, useState } from 'react';
import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import styled from 'styled-components';

interface JSONViewerProps {
    url: string;
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

export const JSONViewer = ({ url }: JSONViewerProps) => {
    const [jsonData, setJsonData] = useState<Record<string, unknown> | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadJSON = async () => {
            try {
                const response = await fetch(url);
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
    }, [url]);

    if (error) {
        return <ViewerContainer>Error: {error}</ViewerContainer>;
    }

    if (!jsonData) {
        return <ViewerContainer>Loading...</ViewerContainer>;
    }

    return (
        <ViewerContainer>
            <JsonView
                data={jsonData}
                shouldExpandNode={allExpanded}
                style={defaultStyles}
            />
        </ViewerContainer>
    );
};
