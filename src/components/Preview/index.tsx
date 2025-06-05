import { useEffect, useRef } from 'react';
import { usePagination } from '@/contexts';
import { useHighlight } from '@/contexts/highlight';
import { DoclingDocument, DoclingNode } from '@/types';
import { Picture, Table, Text } from './components';
import { S } from './style';
import { checkItemInCurrentPage, findItemInData } from './util';

interface PreviewProps {
    data: DoclingDocument;
}

export const Preview = ({ data }: PreviewProps) => {
    const highlightedElementRef = useRef<HTMLElement>(null);
    const { currentPage } = usePagination();
    const { highlightedRef, setHighlightedRef } = useHighlight();

    const isNodeInCurrentPage = (node: DoclingNode): boolean => {
        if (!node.$ref) return false;

        const checkData = { nodeRef: node.$ref, currentPage };

        if (
            checkItemInCurrentPage({
                items: data.texts,
                ...checkData,
            }) ||
            checkItemInCurrentPage({
                items: data.pictures,
                ...checkData,
            }) ||
            checkItemInCurrentPage({
                items: data.tables,
                ...checkData,
            })
        )
            return true;

        // 그룹의 경우 자식 노드들 중 하나라도 현재 페이지에 있으면 표시
        const group = findItemInData({
            items: data.groups,
            nodeRef: node.$ref,
        });

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

        if (!node.$ref) return null;

        const textItem = findItemInData({
            items: data.texts,
            nodeRef: node.$ref,
        });
        const group = findItemInData({
            items: data.groups,
            nodeRef: node.$ref,
        });
        const picture = findItemInData({
            items: data.pictures,
            nodeRef: node.$ref,
        });
        const table = findItemInData({
            items: data.tables,
            nodeRef: node.$ref,
        });

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
                            onHighlightChange={setHighlightedRef}
                        />
                    )}
                    {picture && (
                        <Picture
                            picture={picture}
                            data={data}
                            isHighlighted={isHighlighted}
                            highlightedRef={highlightedRef}
                            highlightedElementRef={highlightedElementRef}
                            onHighlightChange={setHighlightedRef}
                        />
                    )}
                    {table && (
                        <Table
                            table={table}
                            data={data}
                            isHighlighted={isHighlighted}
                            highlightedRef={highlightedRef}
                            highlightedElementRef={highlightedElementRef}
                            onHighlightChange={setHighlightedRef}
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
