import styled from 'styled-components';
import { usePagination } from '@/contexts/pagination';

const PageControls = styled.div`
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px 16px;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
`;

const PageButton = styled.button`
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    background-color: #f8f9fa;
    color: #212529;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
        background-color: #e9ecef;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const PageInfo = styled.div`
    font-size: 14px;
    color: #495057;
`;

export const Pagination = () => {
    const { currentPage, totalPages, handlePrevPage, handleNextPage } =
        usePagination();

    return (
        <PageControls>
            <PageButton onClick={handlePrevPage} disabled={currentPage <= 1}>
                이전
            </PageButton>
            <PageInfo>
                {currentPage} / {totalPages}
            </PageInfo>
            <PageButton
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
            >
                다음
            </PageButton>
        </PageControls>
    );
};
