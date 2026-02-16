"use client"

import { useEffect, useState } from "react"
import Search from "@/app/components/ui/Search"
import DatePickers from "@/app/components/ui/DatePickers"
import Actions from "@/app/components/ui/Actions"
import { Pagination } from "@/app/components/ui/Pagination"
import { Table } from "@/app/components/layout/Table"
import { useTable } from "@/hooks/useTable"

type Row = {
    saleman: string
    docno: string
    ref1: string
    ref2: string
    amount: number
    payment: string
    dateTime: string
    cusName: string
    bankRef: string
    respMsg: string
    qrContent: string
}

export default function TrackingPage() {
    const [keyword, setKeyword] = useState("")
    const [from, setFrom] = useState<string>()
    const [to, setTo] = useState<string>()

    // server pagination
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    // data state
    const [data, setData] = useState<Row[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 🔥 fetch GET list
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                const params = new URLSearchParams({
                    page: page.toString(),
                    pageSize: pageSize.toString(),
                })

                if (keyword) params.set("search", keyword)
                if (from) params.set("from", from)
                if (to) params.set("to", to)

                const res = await fetch(`/api/report/list?${params.toString()}`)
                if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")

                const json = await res.json()
                setData(json.items)
                setTotalPages(json.totalPages)
            } catch (e: any) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [page, pageSize, keyword, from, to])




    const table = useTable({
        data,
        columns: [
            { key: "saleman", label: "Saleman" },
            { key: "dateTime", label: "Date Time" },
            { key: "ref1", label: "Ref 1" },
            { key: "ref2", label: "Ref 2" },
            { key: "docno", label: "Doc No", sortable: true },
            { key: "amount", label: "Amount", sortable: true },
            { key: "cusName", label: "Customer" },
            { key: "bankRef", label: "Bank" },
            { key: "respMsg", label: "Status" },
            { key: "qrContent", label: "QR Content" }
        ],
        page,
        pageSize,
        totalPages,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
    })

    return (
        <div className="h-full p-2 flex flex-col gap-2">
            <div className="font-bold text-2xl">Tracking</div>

            <div className="h-8 flex items-center justify-between gap-10">
                <div className="flex gap-2">
                    <div className="w-80">
                        <Search
                            onSearch={(v) => {
                                setKeyword(v)
                                setPage(1)
                            }}
                        />
                    </div>

                    <DatePickers
                        onChange={(f, t) => {
                            setFrom(f)
                            setTo(t)
                            setPage(1)
                        }}
                    />
                </div>
                <Actions columns={table.columns} data={data} />
            </div>

            <div className="w-full h-[95%] flex flex-col justify-between">
                <div >
                    {loading && <div className="text-center py-10">Loading...</div>}
                    {error && <div className="text-center text-red-500">{error}</div>}
                    {!loading && !error && <Table table={table} />}
                </div>

                <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                />
            </div>
        </div>
    )
}
