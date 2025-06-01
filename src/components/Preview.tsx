import { useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { DoclingDocument, DoclingNode } from '@/types';

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
`;

const StyledList = styled.ul`
    margin: 0;
    padding-left: 20px;
`;

interface StyledProps {
    $highlighted?: boolean;
}

const StyledListItem = styled.li<StyledProps>`
    margin: 4px 0;
    list-style-type: none;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    ${(props) =>
        props.$highlighted &&
        css`
            background-color: rgba(255, 255, 0, 0.2);
        `}
`;

const StyledHeader = styled.h2<StyledProps>`
    margin: 16px 0 8px;
    font-size: 1.5em;
    font-weight: bold;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    ${(props) =>
        props.$highlighted &&
        css`
            background-color: rgba(255, 255, 0, 0.2);
        `}
`;

const StyledSectionHeader = styled.h6<StyledProps>`
    margin: 12px 0 6px;
    font-size: 1.1em;
    color: #495057;
    font-weight: bold;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    ${(props) =>
        props.$highlighted &&
        css`
            background-color: rgba(255, 255, 0, 0.2);
        `}
`;

const StyledDefaultText = styled.div<StyledProps>`
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    ${(props) =>
        props.$highlighted &&
        css`
            background-color: rgba(255, 255, 0, 0.2);
        `}
`;

const GroupContainer = styled.div`
    margin-left: 20px;
    border-left: 2px solid #dee2e6;
    padding-left: 12px;
`;

const ImageContainer = styled.div<StyledProps>`
    display: inline-block;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    ${(props) =>
        props.$highlighted &&
        css`
            background-color: rgba(255, 255, 0, 0.2);
        `}
`;

const ImagePreview = styled.img`
    max-width: 200px;
    height: auto;
    margin-top: 8px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
`;

const TablePreview = styled.table<StyledProps>`
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

    ${(props) =>
        props.$highlighted &&
        css`
            background-color: rgba(255, 255, 0, 0.2);
        `}
`;

interface PreviewProps {
    data: DoclingDocument;
    highlightedRef: string | null;
}

export const Preview = ({ data, highlightedRef }: PreviewProps) => {
    const highlightedElementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (highlightedRef && highlightedElementRef.current) {
            highlightedElementRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [highlightedRef]);

    const renderNode = (node: DoclingNode) => {
        const textItem = data.texts.find((text) => text.self_ref === node.$ref);
        const group = data.groups.find((group) => group.self_ref === node.$ref);
        const picture = data.pictures.find((pic) => pic.self_ref === node.$ref);
        const table = data.tables.find((tbl) => tbl.self_ref === node.$ref);

        const isHighlighted = node.$ref === highlightedRef;

        const renderText = (() => {
            if (!textItem) {
                return null;
            }

            const content = textItem.text || textItem.orig;

            switch (textItem.label) {
                case 'list':
                    return <StyledList>{content}</StyledList>;
                case 'list_item':
                    return (
                        <StyledListItem $highlighted={isHighlighted}>
                            {content}
                        </StyledListItem>
                    );
                case 'page_header':
                    return (
                        <StyledHeader $highlighted={isHighlighted}>
                            {content}
                        </StyledHeader>
                    );
                case 'section_header':
                    return (
                        <StyledSectionHeader $highlighted={isHighlighted}>
                            {content}
                        </StyledSectionHeader>
                    );
                default:
                    return (
                        <StyledDefaultText $highlighted={isHighlighted}>
                            {content}
                        </StyledDefaultText>
                    );
            }
        })();

        const renderTable = (() => {
            if (!table) {
                return null;
            }

            const rowSpanTracker: number[] = new Array(
                table.data.num_cols,
            ).fill(0);

            return (
                <TablePreview $highlighted={isHighlighted}>
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
                    {group.children.map((child) => renderNode(child))}
                </GroupContainer>
            );
        })();

        return (
            <div
                key={node.$ref || node.self_ref}
                ref={isHighlighted ? highlightedElementRef : null}
            >
                <NodeInfo>
                    {renderText}
                    {picture && (
                        <ImageContainer $highlighted={isHighlighted}>
                            <ImagePreview
                                width={picture.image.size.width}
                                height={picture.image.size.height}
                                src={picture.image.uri}
                                alt={picture.label}
                            />
                        </ImageContainer>
                    )}
                    {renderTable}
                    {renderGroup}
                </NodeInfo>
            </div>
        );
    };

    const renderBody = (() => {
        if (!data.body) {
            return <div>No body</div>;
        }

        const { body } = data;
        return (
            <section>
                {body.children?.map((child) => renderNode(child))}
            </section>
        );
    })();

    return <PreviewContainer>{renderBody}</PreviewContainer>;
};
