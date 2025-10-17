import type React from "react"
import type { Metadata } from "next"
import { Providers } from "@/providers"
import { DashboardSidebar } from "./_components/DashboardSidebar"
import { Toaster } from "@/components/ui"

export const metadata: Metadata = {
    title: "Aurelia - Dashboard Superadmin",
    description: "Panel de administración para superadmins de Aurelia",
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Providers>
            <div className="min-h-screen bg-gray-50">
                <div className="flex">
                    <DashboardSidebar />
                    <main className="flex-1 ml-64 p-6">
                        {children}
                    </main>
                </div>
            </div>
            <Toaster />
        </Providers>
    )
}
