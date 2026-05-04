const DataTable = ({ columns, rows, getRowKey, isLoading, emptyState }) => {
  if (isLoading) {
    return (
      <div className="panel overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-8 text-sm font-medium text-ink-500">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-700" />
          Loading records...
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return emptyState;
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50/80 text-left text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-5 py-3.5 first:pl-6 last:pr-6">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="align-top transition hover:bg-ink-50/70"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-5 py-4 text-ink-700 first:pl-6 last:pr-6"
                  >
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
