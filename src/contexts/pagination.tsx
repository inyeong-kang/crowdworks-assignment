import { ReactNode, createContext, useContext, useState } from 'react';

interface PaginationContextType {
    currentPage: number;
    totalPages: number;
    setTotalPages: (total: number) => void;
    handlePrevPage: () => void;
    handleNextPage: () => void;
}

const PaginationContext = createContext<PaginationContextType | null>(null);

interface PaginationProviderProps {
    children: ReactNode;
}

export const PaginationProvider = ({ children }: PaginationProviderProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <PaginationContext.Provider
            value={{
                currentPage,
                totalPages,
                setTotalPages,
                handlePrevPage,
                handleNextPage,
            }}
        >
            {children}
        </PaginationContext.Provider>
    );
};

export const usePagination = () => {
    const context = useContext(PaginationContext);
    if (!context) {
        throw new Error(
            'usePagination must be used within a PaginationProvider',
        );
    }
    return context;
};
