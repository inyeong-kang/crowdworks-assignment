import { useEffect, useRef } from 'react';
import { usePagination } from '@/contexts';
import { DoclingDocument, DoclingNode } from '@/types';
import { Picture, Table, Text } from './components';
import { S } from './style';

interface PreviewProps {
    data: DoclingDocument;
    highlightedRef: string | null;
    onHighlightChange: (ref: string | null) => void;
}

export const Preview = ({
    data,
    highlightedRef,
    onHighlightChange,
}: PreviewProps) => {
    const highlightedElementRef = useRef<HTMLElement>(null);
    const { currentPage } = usePagination();

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

        const renderGroup = (() => {
            if (!group?.children) {
                return null;
            }

            return (
                <S.GroupContainer>
                    {group.children.map((child) => renderNode(child))}
                </S.GroupContainer>
            );
        })();

        return (
            <div key={node.$ref || node.self_ref}>
                <S.NodeInfo>
                    {textItem && (
                        <Text
                            textItem={textItem}
                            data={data}
                            isHighlighted={isHighlighted}
                            highlightedRef={highlightedRef}
                            highlightedElementRef={highlightedElementRef}
                            onHighlightChange={onHighlightChange}
                        />
                    )}
                    {picture && (
                        <Picture
                            picture={picture}
                            data={data}
                            isHighlighted={isHighlighted}
                            highlightedRef={highlightedRef}
                            highlightedElementRef={highlightedElementRef}
                            onHighlightChange={onHighlightChange}
                        />
                    )}
                    {table && (
                        <Table
                            table={table}
                            data={data}
                            isHighlighted={isHighlighted}
                            highlightedRef={highlightedRef}
                            highlightedElementRef={highlightedElementRef}
                            onHighlightChange={onHighlightChange}
                        />
                    )}
                    {renderGroup}
                </S.NodeInfo>
            </div>
        );
    };

    const renderBody = (() => {
        if (!data.body) {
            return <div>No body</div>;
        }

        return (
            <section>
                {data.body.children?.map((child) => renderNode(child))}
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

    return <S.PreviewContainer>{renderBody}</S.PreviewContainer>;
};
