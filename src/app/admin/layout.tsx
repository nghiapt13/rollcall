import { Metadata } from "next"
import { metadata as rootMetadata } from "../layout"

export const metadata: Metadata = {
    title: `Trang quản trị | ${rootMetadata.title}`
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="">
            <div className="">
                {children}
            </div>
        </div>
    )
}
