import { RefObject, useCallback, useEffect, useRef } from 'react';
import { useHighlight } from '@/contexts/highlight';
import { DoclingDocument } from '@/types';
import { NodeRenderer } from './components';
import { S } from './style';

interface PreviewProps {
    data: DoclingDocument;
}

export const Preview = ({ data }: PreviewProps) => {
    const highlightedElementRef = useRef<HTMLElement>(null);
    const { highlightedRef } = useHighlight();

    const renderBody = (() => {
        if (!data.body) {
            return <div>No body</div>;
        }

        return (
            <section>
                {data.body.children?.map((child) => (
                    <NodeRenderer
                        key={child.$ref || child.self_ref}
                        node={child}
                        data={data}
                        highlightedElementRef={
                            highlightedElementRef as RefObject<HTMLElement>
                        }
                    />
                ))}
            </section>
        );
    })();

    const handleScroll = useCallback(() => {
        if (highlightedRef && highlightedElementRef.current) {
            highlightedElementRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [highlightedRef]);

    useEffect(() => {
        handleScroll();
    }, [handleScroll]);

    return <S.PreviewContainer>{renderBody}</S.PreviewContainer>;
};
