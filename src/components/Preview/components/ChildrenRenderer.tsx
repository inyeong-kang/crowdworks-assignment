import { RefObject } from 'react';
import { S } from '../style';
import { BaseProps } from '../type';

interface ChildrenRendererProps extends Omit<BaseProps, 'isHighlighted'> {
    children: { $ref: string }[];
}

export const ChildrenRenderer = ({
    children,
    data,
    highlightedRef,
    highlightedElementRef,
    onHighlightChange,
}: ChildrenRendererProps) => {
    return (
        <S.GroupContainer>
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
                    <S.DefaultText
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
                    </S.DefaultText>
                );
            })}
        </S.GroupContainer>
    );
};
