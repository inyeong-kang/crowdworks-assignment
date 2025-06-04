import { RefObject, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { usePagination } from '@/contexts';
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

interface StyledProps {
    $highlighted?: boolean;
    $isCaption?: boolean;
}

const clickableStyle = css`
    cursor: pointer;
`;

const highlightStyle = css<StyledProps>`
    ${(props) =>
        props.$highlighted &&
        css`
            background-color: rgba(255, 255, 0, 0.2);
        `}
`;

const StyledList = styled.ul<StyledProps>`
    margin: 0;
    padding-left: 20px;
    ${clickableStyle}
    ${highlightStyle}
`;

const StyledListItem = styled.li<StyledProps>`
    margin: 4px 0;
    list-style-type: none;
    padding: 4px;
    border-radius: 4px;
    ${clickableStyle}
    ${highlightStyle}
`;

const StyledHeader = styled.h2<StyledProps>`
    margin: 16px 0 8px;
    font-size: 1.5em;
    font-weight: bold;
    padding: 4px;
    border-radius: 4px;
    ${clickableStyle}
    ${highlightStyle}
`;

const StyledSectionHeader = styled.h6<StyledProps>`
    margin: 12px 0 6px;
    font-size: 1.1em;
    color: #495057;
    font-weight: bold;
    padding: 4px;
    border-radius: 4px;
    ${clickableStyle}
    ${highlightStyle}
`;

const StyledDefaultText = styled.div<StyledProps>`
    padding: 4px;
    border-radius: 4px;
    ${clickableStyle}
    ${highlightStyle}
    ${(props) =>
        props.$isCaption &&
        css`
            font-style: italic;
            text-align: center;
            color: #666;
            font-size: 0.9em;
            margin: 8px 0;
            padding: 8px;
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
    ${clickableStyle}
    ${highlightStyle}
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
    ${clickableStyle}
    ${highlightStyle}

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

interface PreviewProps {
    data: DoclingDocument;
    highlightedRef: string | null;
    onHighlightChange: (ref: string | null) => void;
}

interface ChildrenRendererProps {
    children: { $ref: string }[];
    data: DoclingDocument;
    highlightedRef: string | null;
    highlightedElementRef: RefObject<HTMLElement | null>;
    onHighlightChange: (ref: string | null) => void;
}

const ChildrenRenderer = ({
    children,
    data,
    highlightedRef,
    highlightedElementRef,
    onHighlightChange,
}: ChildrenRendererProps) => {
    return (
        <GroupContainer>
            {children.map((child) => {
                const childText = data.texts.find(
                    (text) => text.self_ref === child.$ref,
                );
                if (!childText) return null;

                const isChildHighlighted =
                    childText.self_ref === highlightedRef;
                const content = childText.text || childText.orig;
                const isCaption = childText.label === 'caption';

                return (
                    <StyledDefaultText
                        key={childText.self_ref}
                        ref={
                            isChildHighlighted
                                ? (highlightedElementRef as RefObject<HTMLDivElement>)
                                : null
                        }
                        $highlighted={isChildHighlighted}
                        $isCaption={isCaption}
                        onClick={() => onHighlightChange(childText.self_ref)}
                    >
                        {content}
                    </StyledDefaultText>
                );
            })}
        </GroupContainer>
    );
};

export const Preview = ({
    data,
    highlightedRef,
    onHighlightChange,
}: PreviewProps) => {
    const highlightedElementRef = useRef<HTMLElement>(null);
    const { currentPage } = usePagination();

    const handleClick = (ref: string) => {
        onHighlightChange(ref === highlightedRef ? null : ref);
    };

    const isNodeInCurrentPage = (node: DoclingNode): boolean => {
        const textItem = data.texts.find((text) => text.self_ref === node.$ref);
        const picture = data.pictures.find((pic) => pic.self_ref === node.$ref);
        const table = data.tables.find((tbl) => tbl.self_ref === node.$ref);

        if (textItem?.prov) {
            return textItem.prov.some((p) => p.page_no === currentPage);
        }
        if (picture?.prov) {
            return picture.prov.some((p) => p.page_no === currentPage);
        }
        if (table?.prov) {
            return table.prov.some((p) => p.page_no === currentPage);
        }

        // 그룹의 경우 자식 노드들 중 하나라도 현재 페이지에 있으면 표시
        const group = data.groups.find((group) => group.self_ref === node.$ref);
        if (group?.children) {
            return group.children.some((child) => isNodeInCurrentPage(child));
        }

        return false;
    };

    const renderNode = (node: DoclingNode) => {
        // 현재 페이지에 없는 노드는 렌더링하지 않음
        if (!isNodeInCurrentPage(node)) {
            return null;
        }

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
                    return (
                        <StyledList
                            ref={
                                isHighlighted
                                    ? (highlightedElementRef as RefObject<HTMLUListElement>)
                                    : null
                            }
                            $highlighted={isHighlighted}
                            onClick={() => handleClick(textItem.self_ref)}
                        >
                            {content}
                        </StyledList>
                    );
                case 'list_item':
                    return (
                        <StyledListItem
                            ref={
                                isHighlighted
                                    ? (highlightedElementRef as RefObject<HTMLLIElement>)
                                    : null
                            }
                            $highlighted={isHighlighted}
                            onClick={() => handleClick(textItem.self_ref)}
                        >
                            {content}
                        </StyledListItem>
                    );
                case 'page_header':
                    return (
                        <StyledHeader
                            ref={
                                isHighlighted
                                    ? (highlightedElementRef as RefObject<HTMLHeadingElement>)
                                    : null
                            }
                            $highlighted={isHighlighted}
                            onClick={() => handleClick(textItem.self_ref)}
                        >
                            {content}
                        </StyledHeader>
                    );
                case 'section_header':
                    return (
                        <StyledSectionHeader
                            ref={
                                isHighlighted
                                    ? (highlightedElementRef as RefObject<HTMLHeadingElement>)
                                    : null
                            }
                            $highlighted={isHighlighted}
                            onClick={() => handleClick(textItem.self_ref)}
                        >
                            {content}
                        </StyledSectionHeader>
                    );
                default:
                    return (
                        <StyledDefaultText
                            ref={
                                isHighlighted
                                    ? (highlightedElementRef as RefObject<HTMLDivElement>)
                                    : null
                            }
                            $highlighted={isHighlighted}
                            onClick={() => handleClick(textItem.self_ref)}
                        >
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
                <>
                    <TablePreview
                        ref={
                            isHighlighted
                                ? (highlightedElementRef as RefObject<HTMLTableElement>)
                                : null
                        }
                        $highlighted={isHighlighted}
                        onClick={() => handleClick(table.self_ref)}
                    >
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
                                                    rowSpanTracker[
                                                        cellIndex + i
                                                    ] = cell.row_span - 1;
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
                    {table.children && (
                        <ChildrenRenderer
                            children={table.children}
                            data={data}
                            highlightedRef={highlightedRef}
                            highlightedElementRef={highlightedElementRef}
                            onHighlightChange={onHighlightChange}
                        />
                    )}
                </>
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
            <div key={node.$ref || node.self_ref}>
                <NodeInfo>
                    {renderText}
                    {picture && (
                        <>
                            <ImageContainer
                                ref={
                                    isHighlighted
                                        ? (highlightedElementRef as RefObject<HTMLDivElement>)
                                        : null
                                }
                                $highlighted={isHighlighted}
                                onClick={() => handleClick(picture.self_ref)}
                            >
                                <ImagePreview
                                    width={picture.image.size.width}
                                    height={picture.image.size.height}
                                    src={picture.image.uri}
                                    alt={picture.label}
                                />
                            </ImageContainer>
                            {picture.children && (
                                <ChildrenRenderer
                                    children={picture.children}
                                    data={data}
                                    highlightedRef={highlightedRef}
                                    highlightedElementRef={
                                        highlightedElementRef
                                    }
                                    onHighlightChange={onHighlightChange}
                                />
                            )}
                        </>
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

    useEffect(() => {
        if (highlightedRef && highlightedElementRef.current) {
            highlightedElementRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [highlightedRef]);

    return <PreviewContainer>{renderBody}</PreviewContainer>;
};
