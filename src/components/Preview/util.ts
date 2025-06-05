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
