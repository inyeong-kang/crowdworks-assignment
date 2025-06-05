import { DoclingDocument, DoclingNode } from '@/types';

interface FindItemParams<T> {
    items: T[];
    nodeRef: string;
}

interface CheckItemParams<T> extends FindItemParams<T> {
    currentPage: number;
}

export const findItemInData = <T extends { self_ref: string }>({
    items,
    nodeRef,
}: FindItemParams<T>): T | undefined => {
    return items.find((item) => item.self_ref === nodeRef);
};

export const checkItemInCurrentPage = <
    T extends { self_ref: string; prov?: { page_no: number }[] },
>({
    items,
    nodeRef,
    currentPage,
}: CheckItemParams<T>): boolean => {
    const item = findItemInData({ items, nodeRef });
    return item?.prov
        ? item.prov.some((p) => p.page_no === currentPage)
        : false;
};

export const isNodeInCurrentPage = (
    node: DoclingNode,
    data: DoclingDocument,
    currentPage: number,
): boolean => {
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

    const group = findItemInData({
        items: data.groups,
        nodeRef: node.$ref,
    });

    if (group?.children) {
        return group.children.some((child) =>
            isNodeInCurrentPage(child, data, currentPage),
        );
    }

    return false;
};
