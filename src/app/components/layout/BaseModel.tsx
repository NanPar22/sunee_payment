"use client"

type Props = {
    open: boolean
    title: string
    children: React.ReactNode
    onClose: () => void
    footer?: React.ReactNode
}

export default function BaseModal({
    open,
    title,
    children,
    onClose,
    footer,
}: Props) {

    if (!open) return null

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                    {title}
                </h2>

                <div className="space-y-4">
                    {children}
                </div>

                {footer && (
                    <div className="flex gap-3 mt-6 justify-end">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}
