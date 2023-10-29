import { useState } from 'react';

export default function Table({ rows, columns, searchColumns = [] }) {
    // Step 1: State Management
    const [search, setSearch] = useState("");

    // Filtering Mechanism
    const filteredRows = rows.filter(row => {
        return searchColumns.some(column => {
            const value = row[column];
            return value && value.toString().toLowerCase().includes(search.toLowerCase());
        });
    });

    return (
        <div className="min-w-full overflow-hidden overflow-x-auto">
            <div className="mb-4">
                <label htmlFor="search" className="sr-only">Search</label>
                <input
                    id="search"
                    type="text"
                    className="p-2 border rounded"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        {Object.values(columns).map((columnName, idx) => (
                            <th key={idx} className="py-2 px-4 border-b border-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                {columnName}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredRows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {Object.keys(columns).map((property, cellIndex) => (
                                <td key={cellIndex} className="py-2 px-4 border-b border-gray-200">
                                    {row[property]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
