import styled from 'styled-components';
import { clickableStyle, highlightStyle } from '../../style';
import { StyledProps } from '../../type';

export const ImageContainer = styled.div<StyledProps>`
    display: inline-block;
    padding: 4px;
    border-radius: 4px;
    ${clickableStyle}
    ${highlightStyle}
`;

export const ImagePreview = styled.img`
    max-width: 200px;
    height: auto;
    margin-top: 8px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
`;
