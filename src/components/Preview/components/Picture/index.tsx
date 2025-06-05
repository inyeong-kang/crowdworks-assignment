import { RefObject } from 'react';
import { PictureItem } from '@/types';
import { BaseProps } from '../../type';
import { NodeRenderer } from '../NodeRenderer';
import { ImageContainer, ImagePreview } from './style';

interface PictureProps extends BaseProps {
    picture: PictureItem;
}

export const Picture = ({
    picture,
    data,
    isHighlighted,
    highlightedElementRef,
    onHighlightChange,
}: PictureProps) => {
    const { children, image, label, self_ref } = picture;
    const { size, uri } = image;

    return (
        <>
            <ImageContainer
                ref={
                    isHighlighted
                        ? (highlightedElementRef as RefObject<HTMLDivElement>)
                        : null
                }
                $highlighted={isHighlighted}
                onClick={() => onHighlightChange(self_ref)}
            >
                <ImagePreview
                    width={size.width}
                    height={size.height}
                    src={uri}
                    alt={label}
                />
            </ImageContainer>
            {children?.map((child) => (
                <NodeRenderer
                    key={child.$ref}
                    node={{
                        ...child,
                        type: 'node',
                        self_ref: child.$ref,
                    }}
                    data={data}
                    highlightedElementRef={highlightedElementRef}
                />
            ))}
        </>
    );
};
