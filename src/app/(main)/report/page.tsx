"use client"

import { useEffect, useState } from "react"
import Search from "@/app/components/ui/Search"
import DatePickers from "@/app/components/ui/DatePickers"
import Actions from "@/app/components/ui/Actions"
import { Pagination } from "@/app/components/ui/Pagination"
import { Table } from "@/app/components/layout/Table"
import { useTable } from "@/hooks/useTable"

type Row = {
    id: number
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

    // fetch GET list   
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

                const res = await fetch(`/api/report/list?${params.toString()}`, {
                    credentials: "include" // ✅ เพิ่มบรรทัดนี้
                })
                if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")

                const json = await res.json()
                console.log("API ITEMS:", json.items)   // 👈 เพิ่มบรรทัดนี้
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
            {
                key: "dateTime",
                label: "Date Time",
                render: (value: string | number) => {
                    if (!value) return "-"
                    const date = new Date(value as string)
                    return date.toLocaleString("th-TH", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    })
                }
            },
            { key: "ref1", label: "Ref 1" },
            { key: "ref2", label: "Ref 2" },
            { key: "docno", label: "Doc No", sortable: true },
            { key: "amount", label: "Amount", sortable: true },
            { key: "cusName", label: "Customer" },
            { key: "bankRef", label: "Bank" },
            { key: "respMsg", label: "Status" },
            {
                key: "qrContent",
                label: "QR",
                className: "max-w-[200px] break-all whitespace-normal"
            }
        ],
        page,
        pageSize,
        totalPages,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
    })

    return (
        <div className="h-full p-2 flex flex-col gap-2">
            <div className="font-bold text-blue-600 text-2xl max-lg:text-center xl:text-left">
                Reports
            </div>

            <div className="h-8 flex items-center justify-between gap-10">
                <div className="flex gap-2">
                    <div className="w-80 max-lg:w-40">
                        <Search
                            onSearch={(v) => {
                                setKeyword(v)
                                setPage(1)
                            }}
                        />
                    </div>

                    <div className="   ">
                        <DatePickers
                            onChange={(f, t) => {
                                setFrom(f)
                                setTo(t)
                                setPage(1)
                            }}
                        />
                    </div>

                </div>
                <Actions columns={table.columns} data={data} />
            </div>

            <div className="w-full flex-1 min-h-0 flex flex-col justify-between gap-4">
                <div className="flex-1 min-h-0 " >
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
