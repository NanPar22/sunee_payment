'use client'

import Search from "@/app/components/ui/Search";
import { useState } from "react";
import DatePickers from "@/app/components/ui/DatePickers";
import { useTable } from "@/hooks/useTable";
import { Table } from "@/app/components/layout/Table";

type User = {
    id: number
    name: string
    email: string
    createdAt: string
}

const mockData: User[] = [
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
    { id: 1, name: "John", email: "john@test.com", createdAt: "2024-01-01" },
    { id: 2, name: "Jane", email: "jane@test.com", createdAt: "2024-01-02" },
    { id: 3, name: "Bob", email: "bob@test.com", createdAt: "2024-01-03" },
]


export default function LoginForm() {
    const [date, setDate] = useState<Date | null>(new Date())

    // ✅ เรียก hook ตรงนี้ (สำคัญ)
    const table = useTable<User>(
        mockData,
        [
            { key: "id", label: "ID", sortable: true },
            { key: "name", label: "Name", sortable: true },
            { key: "email", label: "Email" },
            { key: "createdAt", label: "Created At", sortable: true },
        ],
        10
    )
    return (
        <div className="h-full  p-2  flex flex-col gap-2">
            <div className="font-bold text-2xl">
                tracking
            </div>
            <div className="h-8   flex items-center  gap-10">
                <div className="w-80">
                    <Search />
                </div>
                <div className="">
                    <DatePickers />
                </div>
            </div>
            <div className=" w-full h-full">
                <Table<User> table={table} />
            </div>
        </div>
    )

}