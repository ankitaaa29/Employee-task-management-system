import React from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface TableProps {
  columns: Column[];
  data: any[];
  renderRow: (item: any, index: number) => React.ReactNode;
  onSort?: (field: string) => void;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  loading?: boolean;
  emptyMessage?: string;
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  renderRow,
  onSort,
  sortField,
  sortOrder,
  loading = false,
  emptyMessage = 'No data available'
}) => {
  const handleSortClick = (column: Column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  return (
    <div className="table-container">
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSortClick(col)}
                  style={{
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {col.label}
                    {col.sortable && sortField === col.key && (
                      <span style={{ fontSize: '0.7rem' }}>
                        {sortOrder === 'ASC' ? '▲' : '▼'}
                      </span>
                    )}
                    {col.sortable && sortField !== col.key && (
                      <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                        ▲▼
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="spinner-border text-primary" role="status" style={{
                    width: '2rem',
                    height: '2rem',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid var(--primary-color)',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading records...</div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => renderRow(item, index))
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
export default Table;
