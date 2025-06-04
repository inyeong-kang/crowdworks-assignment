import styled from 'styled-components';
import { clickableStyle, highlightStyle } from '../../style';
import { StyledProps } from '../../type';

export const TablePreview = styled.table<StyledProps>`
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 12px;
    ${clickableStyle}
    ${highlightStyle}

    th,
    td {
        border: 1px solid #dee2e6;
        padding: 4px;
        text-align: center;
    }

    th {
        background-color: #f8f9fa;
        font-weight: bold;
    }
`;
