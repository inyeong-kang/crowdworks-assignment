import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { DoclingDocument, DoclingNode, PreviewProps } from '@/types';

const PreviewContainer = styled.div`
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NodeInfo = styled.div`
    margin-bottom: 8px;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #495057;

    &:hover {
        background-color: #e9ecef;
    }
`;

const StyledList = styled.ul`
    margin: 0;
    padding-left: 20px;
    list-style-type: disc;
`;

const StyledListItem = styled.li`
    margin: 4px 0;
`;

const StyledHeader = styled.h2`
    margin: 16px 0 8px;
    font-size: 1.5em;
    font-weight: bold;
`;

const StyledSectionHeader = styled.h6`
    margin: 12px 0 6px;
    font-size: 1.1em;
    color: #495057;
    font-weight: bold;
`;

const GroupContainer = styled.div`
    margin-left: 20px;
    border-left: 2px solid #dee2e6;
    padding-left: 12px;
`;

const ImagePreview = styled.img`
    max-width: 200px;
    height: auto;
    margin-top: 8px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
`;

const TablePreview = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 12px;

    th,
    td {
        border: 1px solid #dee2e6;
        padding: 4px;
        text-align: center;
    }

    th {
        background-color: #f8f9fa;
        font-weight: bold;
    }
`;

const renderNode = (
    node: DoclingNode,
    docData: DoclingDocument,
    level: number = 0,
) => {
    const textItem = docData.texts.find((text) => text.self_ref === node.$ref);
    const group = docData.groups.find((group) => group.self_ref === node.$ref);
    const picture = docData.pictures.find((pic) => pic.self_ref === node.$ref);
    const table = docData.tables.find((tbl) => tbl.self_ref === node.$ref);

    const renderText = (() => {
        if (!textItem) {
            return null;
        }

        const content = textItem.text || textItem.orig || textItem.content;

        switch (node.label) {
            case 'list':
                return <StyledList>{content}</StyledList>;
            case 'list_item':
                return <StyledListItem>{content}</StyledListItem>;
            case 'page_header':
                return <StyledHeader>{content}</StyledHeader>;
            case 'section_header':
                return <StyledSectionHeader>{content}</StyledSectionHeader>;
            default:
                return <div>{content}</div>;
        }
    })();

    const renderTable = (() => {
        if (!table) {
            return null;
        }

        // 각 열별로 row_span이 적용된 행의 수를 추적
        const rowSpanTracker: number[] = new Array(table.data.num_cols).fill(0);

        return (
            <TablePreview>
                <tbody>
                    {table.data.grid.map((row, rowIndex) => {
                        let currentColIndex = 0;
                        return (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => {
                                    if (cellIndex < currentColIndex) {
                                        return null;
                                    }

                                    if (rowSpanTracker[cellIndex] > 0) {
                                        rowSpanTracker[cellIndex]--;
                                        return null;
                                    }

                                    currentColIndex += cell.col_span;

                                    if (cell.row_span > 1) {
                                        for (
                                            let i = 0;
                                            i < cell.col_span;
                                            i++
                                        ) {
                                            rowSpanTracker[cellIndex + i] =
                                                cell.row_span - 1;
                                        }
                                    }

                                    return (
                                        <td
                                            key={cellIndex}
                                            rowSpan={cell.row_span}
                                            colSpan={cell.col_span}
                                        >
                                            {cell.text}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </TablePreview>
        );
    })();

    const renderGroup = (() => {
        if (!group?.children) {
            return null;
        }

        return (
            <GroupContainer>
                {group.children.map((child) =>
                    renderNode(child, docData, level + 1),
                )}
            </GroupContainer>
        );
    })();

    return (
        <div key={node.$ref || node.self_ref}>
            <NodeInfo>
                {renderText}
                {picture && (
                    <ImagePreview
                        width={picture.image.size.width}
                        height={picture.image.size.height}
                        src={picture.image.uri}
                        alt={picture.label}
                    />
                )}
                {renderTable}
                {renderGroup}
            </NodeInfo>
        </div>
    );
};

export const Preview = ({ url }: PreviewProps) => {
    const [docData, setDocData] = useState<DoclingDocument | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadJSON = async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to load JSON');
                }
                const data = await response.json();
                setDocData(data);
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
        return <PreviewContainer>Error: {error}</PreviewContainer>;
    }

    if (!docData) {
        return <PreviewContainer>Loading...</PreviewContainer>;
    }

    const renderBody = (() => {
        if (!docData.body) {
            return <div>No body</div>;
        }

        const { body } = docData;
        return (
            <section>
                {body.children?.map((child) => renderNode(child, docData))}
            </section>
        );
    })();

    return <PreviewContainer>{renderBody}</PreviewContainer>;
};
