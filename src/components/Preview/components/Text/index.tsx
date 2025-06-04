import { RefObject } from 'react';
import { TextItem } from '@/types';
import { S } from '../../style';
import { BaseProps } from '../../type';

interface TextProps extends BaseProps {
    textItem: TextItem;
}

const TAG_MAP = {
    list: 'ul',
    list_item: 'li',
    page_header: 'h2',
    section_header: 'h6',
    default: 'div',
} as const;

type TagMapKey = keyof typeof TAG_MAP;

export const Text = ({
    textItem,
    isHighlighted,
    highlightedElementRef,
    onHighlightChange,
}: TextProps) => {
    const content = textItem.text || textItem.orig;
    const label = textItem.label as TagMapKey;
    const as = TAG_MAP[label] || TAG_MAP.default;

    return (
        <S.DefaultText
            as={as}
            ref={
                isHighlighted
                    ? (highlightedElementRef as RefObject<HTMLDivElement>)
                    : null
            }
            $highlighted={isHighlighted}
            onClick={() => onHighlightChange(textItem.self_ref)}
        >
            {content}
        </S.DefaultText>
    );
};
