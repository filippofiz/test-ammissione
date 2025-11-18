/**
 * Sortable Table Component
 * Reusable table with sortable columns
 */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { LaTeX } from './LaTeX';

interface SortableTableProps {
  title?: string;
  columnHeaders: string[];
  tableData: string[][];
  className?: string;
  maxHeight?: string;
  readOnly?: boolean; // For results view - disables sorting
}

export function SortableTable({
  title,
  columnHeaders,
  tableData,
  className = '',
  maxHeight = 'max-h-96',
  readOnly = false,
}: SortableTableProps) {
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle column sort
  const handleSort = (columnIndex: number) => {
    if (readOnly) return; // Disable sorting in read-only mode

    if (sortColumn === columnIndex) {
      // Toggle sort direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  // Sort the table data
  const sortedData = [...tableData].sort((a, b) => {
    if (sortColumn === null) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    // Try to parse as numbers for numeric sorting
    const aNum = parseFloat(aValue.replace(/[^0-9.-]/g, ''));
    const bNum = parseFloat(bValue.replace(/[^0-9.-]/g, ''));

    let comparison = 0;
    if (!isNaN(aNum) && !isNaN(bNum)) {
      // Numeric comparison
      comparison = aNum - bNum;
    } else {
      // String comparison
      comparison = aValue.localeCompare(bValue);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className={`border-2 border-gray-200 rounded-xl overflow-hidden bg-white ${className}`}>
      {title && (
        <div className="px-6 py-3 bg-gray-50 border-b-2 border-gray-200">
          <h3 className="font-semibold text-gray-800">
            <LaTeX>{title}</LaTeX>
          </h3>
        </div>
      )}

      <div className={`overflow-x-auto ${maxHeight} overflow-y-auto`}>
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              {columnHeaders.map((header, i) => (
                <th
                  key={i}
                  className={`border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 transition-colors select-none ${
                    readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-gray-200'
                  }`}
                  onClick={() => handleSort(i)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <LaTeX>{header}</LaTeX>
                    {!readOnly && (
                      <FontAwesomeIcon
                        icon={
                          sortColumn === i
                            ? sortDirection === 'asc'
                              ? faSortUp
                              : faSortDown
                            : faSort
                        }
                        className={`text-sm ${
                          sortColumn === i ? 'text-brand-green' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="border border-gray-300 px-4 py-2 text-gray-800"
                  >
                    <LaTeX>{cell}</LaTeX>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SortableTable;
