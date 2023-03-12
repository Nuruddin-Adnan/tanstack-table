import React, { useEffect, useState } from 'react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'

import {
    rankItem,
} from '@tanstack/match-sorter-utils'

const Table = () => {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);

    useEffect(() => {
        fetch('https://hospital-management-server-alpha.vercel.app/api/v1/investigationBills')
            .then(res => res.json())
            .then(data => setData(data))
    }, [setData])

    const fuzzyFilter = (row, columnId, value, addMeta) => {
        // Rank the item
        const itemRank = rankItem(row.getValue(columnId), value)

        // Store the itemRank info
        addMeta({
            itemRank,
        })

        // Return if the item should be filtered in/out
        return itemRank.passed
    }

    const columnHelper = createColumnHelper(data);

    const columns = [
        columnHelper.accessor('_id', {
            header: () => 'ID',
        }),
        columnHelper.accessor('patientName', {
            header: () => 'Patient Name',
            cell: info => <i>{info.getValue()}</i>,
            footer: info => info.column.id,
        }),
        columnHelper.accessor('subTotal', {
            header: () => 'Sub Total',
            footer: info => {
                const items = info.table.options.data;
                const totalPrice = items.reduce((acc, item) => acc + item.subTotal, 0);
                return totalPrice;
            },
        }),
        columnHelper.accessor('discount', {
            header: () => 'Discount',
            footer: info => {
                const items = info.table.options.data;
                const totalPrice = items.reduce((acc, item) => acc + parseInt(item.discount), 0);
                return totalPrice;
            },
        }),
        columnHelper.accessor('total', {
            header: () => 'Total',
            footer: info => {
                const items = info.table.options.data;
                const totalPrice = items.reduce((acc, item) => acc + item.total, 0);
                return totalPrice;
            },
        }),
        columnHelper.accessor('received', {
            header: () => 'Received',
            footer: info => {
                const items = info.table.options.data;
                const totalPrice = items.reduce((acc, item) => acc + item.received, 0);
                return totalPrice;
            },
        }),
        columnHelper.accessor('due', {
            header: () => 'Due',
            footer: info => {
                const items = info.table.options.data;
                const totalPrice = items.reduce((acc, item) => acc + parseInt(item.due), 0);
                return totalPrice;
            },
        }),
        columnHelper.accessor('createdAt', {
            header: () => 'Created At',
        }),
    ]

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            sorting,
        },
        columnResizeMode: 'onChange',
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        getSubRows: row => row.subRows,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })


    return (
        <div className='container'>
            <h3 className='text-primary pt-4 pb-2 border-bottom border-primary'>This is tanstack table component</h3>
            <div>
                <input type='text'
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    className="p-2 font-lg shadow border border-block"
                    placeholder="Search all columns..."
                />
            </div>

            <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
                <table className='table table-striped table-bordered table-sm'
                    {...{
                        style: {
                            width: table.getCenterTotalSize(),
                        },
                    }}
                >
                    <thead className='sticky-top bg-white'>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} colSpan={header.colSpan} style={{ width: header.getSize() }} >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                {...{
                                                    className: `${header.column.getCanSort()}
                                                        ? 'cursor-pointer select-none'
                                                        : '' `,
                                                    onClick: header.column.getToggleSortingHandler(),
                                                }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {{
                                                    asc: ' 🔼',
                                                    desc: ' 🔽',
                                                }[header.column.getIsSorted()] ?? null}
                                                {
                                                    <div
                                                        {...{
                                                            onMouseDown: header.getResizeHandler(),
                                                            onTouchStart: header.getResizeHandler(),
                                                            className: `resizer ${header.column.getIsResizing() ? 'isResizing' : ''
                                                                }`
                                                        }}
                                                    />
                                                }
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        {table.getFooterGroups().map(footerGroup => (
                            <tr key={footerGroup.id}>
                                {footerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.footer,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </tfoot>
                </table>
            </div>

            <div className="hstack gap-3 justify-content-end">
                <button
                    className="border rounded p-1"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<<'}
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<'}
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    {'>'}
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                >
                    {'>>'}
                </button>
                <span className="d-flex align-items-center">
                    <div>Page</div>
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                    </strong>
                </span>
                <span className="d-flex align-items-center ">
                    | Go to page:
                    <input
                        type="number"
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            table.setPageIndex(page)
                        }}
                        className="border p-1 rounded w-16"
                    />
                </span>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                        table.setPageSize(Number(e.target.value))
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
            <div>{table.getPrePaginationRowModel().rows.length} Rows</div>
        </div>
    );
};

export default Table;