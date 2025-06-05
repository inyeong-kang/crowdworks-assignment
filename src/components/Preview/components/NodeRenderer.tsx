import { RefObject, memo } from 'react';
import { usePagination } from '@/contexts';
import { useHighlight } from '@/contexts/highlight';
import { DoclingDocument, DoclingNode } from '@/types';
import { S } from '../style';
import { findItemInData, isNodeInCurrentPage } from '../util';
import { Picture, Table, Text } from './index';

interface NodeRendererProps {
    node: DoclingNode;
    data: DoclingDocument;
    highlightedElementRef: RefObject<HTMLElement>;
}

export const NodeRenderer = memo(
    ({ node, data, highlightedElementRef }: NodeRendererProps) => {
        const { highlightedRef, setHighlightedRef } = useHighlight();
        const { currentPage } = usePagination();

        if (!isNodeInCurrentPage(node, data, currentPage)) {
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
                    {group.children.map((child) => (
                        <NodeRenderer
                            key={child.$ref || child.self_ref}
                            node={child}
                            data={data}
                            highlightedElementRef={highlightedElementRef}
                        />
                    ))}
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
    },
);
