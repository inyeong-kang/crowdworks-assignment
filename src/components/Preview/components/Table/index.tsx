import { RefObject, useCallback } from 'react';
import { TableItem } from '@/types';
import { BaseProps } from '../../type';
import { NodeRenderer } from '../NodeRenderer';
import { TablePreview } from './style';

interface TableProps extends BaseProps {
    table: TableItem;
}

export const Table = ({
    table,
    data,
    isHighlighted,
    highlightedElementRef,
    onHighlightChange,
}: TableProps) => {
    const { children, self_ref, data: tableData } = table;
    const { grid, num_cols } = tableData;

    const rowSpanTracker: number[] = new Array(num_cols).fill(0);

    const handleClick = useCallback(() => {
        onHighlightChange(self_ref);
    }, [onHighlightChange, self_ref]);

    return (
        <>
            <TablePreview
                ref={
                    isHighlighted
                        ? (highlightedElementRef as RefObject<HTMLTableElement>)
                        : null
                }
                $highlighted={isHighlighted}
                onClick={handleClick}
            >
                <tbody>
                    {grid.map((row, rowIndex) => {
                        let currentColIndex = 0;
                        return (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => {
                                    if (cellIndex < currentColIndex) {
                                        return null;
                                    }

                                    if (rowSpanTracker[cellIndex] > 0) {
                                        rowSpanTracker[cellIndex]--;
                                        return null;
                                    }

                                    currentColIndex += cell.col_span;

                                    if (cell.row_span > 1) {
                                        for (
                                            let i = 0;
                                            i < cell.col_span;
                                            i++
                                        ) {
                                            rowSpanTracker[cellIndex + i] =
                                                cell.row_span - 1;
                                        }
                                    }

                                    return (
                                        <td
                                            key={cellIndex}
                                            rowSpan={cell.row_span}
                                            colSpan={cell.col_span}
                                        >
                                            {cell.text}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </TablePreview>
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
