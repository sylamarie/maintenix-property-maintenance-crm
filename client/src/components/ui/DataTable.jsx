const DataTable = ({ columns, rows, getRowKey, isLoading, emptyState }) => {
  if (isLoading) {
    return (
      <div className="panel p-6 text-sm font-medium text-ink-500">
        Loading records...
      </div>
    );
  }

  if (!rows.length) {
    return emptyState;
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-ink-100 text-sm">
          <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-3">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="align-top">
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
