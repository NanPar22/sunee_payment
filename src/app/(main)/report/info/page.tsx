"use client"

import { useEffect, useState } from "react"
import Search from "@/app/components/ui/Search"
import DatePickers from "@/app/components/ui/DatePickers"
import Actions from "@/app/components/ui/Actions"
import { Pagination } from "@/app/components/ui/Pagination"
import { Table } from "@/app/components/layout/Table"
import { useTable } from "@/hooks/useTable"

type Row = {
    docno: string
    ref1: string | null
    ref2: string | null
    amount: number
    payment: string | null
    dateTime: string
    cusName: string
}

export default function TrackingPage() {
    const [keyword, setKeyword] = useState("")
    const [from, setFrom] = useState<string>()
    const [to, setTo] = useState<string>()

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState<number>(20)

    const [data, setData] = useState<Row[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // pageSize จาก localStorage
    useEffect(() => {
        const saved = localStorage.getItem("infoPageSize")
        if (saved) setPageSize(Number(saved))
    }, [])

    // default วันนี้
    useEffect(() => {
        const today = new Date().toLocaleDateString("en-CA")
        setFrom(today)
        setTo(today)
    }, [])

    // fetch data
    useEffect(() => {
        if (!from || !to) return

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

                const res = await fetch(
                    `/api/report/info?${params.toString()}`,
                    { credentials: "include" }
                )

                if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")

                const json = await res.json()

                // 🔧 format dateTime ตรงนี้
                const mapped: Row[] = json.items.map((i: Row) => ({
                    ...i,
                    dateTime: new Date(i.dateTime).toLocaleString("th-TH"),
                }))

                setData(mapped)
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
            { key: "dateTime", label: "Date Time" },
            { key: "ref1", label: "Ref 1" },
            { key: "ref2", label: "Ref 2" },
            { key: "docno", label: "Doc No", sortable: true },
            { key: "amount", label: "Amount", sortable: true },
            { key: "cusName", label: "Customer" },
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
                        from={from}
                        to={to}
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
                <div className="h-225">
                    {loading && <div className="text-center py-10">Loading...</div>}
                    {error && <div className="text-center text-red-500">{error}</div>}
                    {!loading && !error && <Table table={table} />}
                </div>

                <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size)
                        setPage(1)
                        localStorage.setItem("infoPageSize", String(size))
                    }}
                />
            </div>
        </div>
    )
}
