import { RefObject } from 'react';
import { PictureItem } from '@/types';
import { BaseProps } from '../../type';
import { ChildrenRenderer } from '../ChildrenRenderer';
import { ImageContainer, ImagePreview } from './style';

interface PictureProps extends BaseProps {
    picture: PictureItem;
}

export const Picture = ({
    picture,
    data,
    isHighlighted,
    highlightedRef,
    highlightedElementRef,
    onHighlightChange,
}: PictureProps) => {
    const { image, label, children, self_ref } = picture;
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
            {children && (
                <ChildrenRenderer
                    children={children}
                    data={data}
                    highlightedRef={highlightedRef}
                    highlightedElementRef={highlightedElementRef}
                    onHighlightChange={onHighlightChange}
                />
            )}
        </>
    );
};
