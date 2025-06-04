import styled, { css } from 'styled-components';
import { StyledProps } from './type';

export const clickableStyle = css`
    cursor: pointer;
`;

export const highlightStyle = css<StyledProps>`
    ${(props) =>
        props.$highlighted &&
        css`
            background-color: rgba(255, 255, 0, 0.2);
        `}
`;

export const S = {
    PreviewContainer: styled.div`
        width: 100%;
        height: 100%;
        overflow: auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    `,

    NodeInfo: styled.div`
        margin-bottom: 8px;
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #495057;
    `,

    DefaultText: styled.div<StyledProps>`
        padding: 4px;
        border-radius: 4px;
        ${clickableStyle}
        ${highlightStyle}
        ${(props) =>
            props.$isCaption &&
            css`
                font-style: italic;
                text-align: center;
                color: #666;
                font-size: 0.9em;
                margin: 8px 0;
                padding: 8px;
            `}
    `,

    GroupContainer: styled.div`
        margin-left: 20px;
        border-left: 2px solid #dee2e6;
        padding-left: 12px;
    `,
};

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
