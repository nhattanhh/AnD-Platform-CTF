import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface LoadingStateProps {
    variant?: "spinner" | "skeleton" | "table"
    rows?: number
    columns?: number
    className?: string
}

export function LoadingState({
    variant = "spinner",
    rows = 3,
    columns = 4,
    className,
}: LoadingStateProps) {
    if (variant === "spinner") {
        return (
            <div className={`flex items-center justify-center py-12 ${className ?? ""}`}>
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (variant === "table") {
        return (
            <div className={`space-y-3 ${className ?? ""}`}>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-4">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <Skeleton
                                key={colIndex}
                                className="h-10 flex-1"
                            />
                        ))}
                    </div>
                ))}
            </div>
        )
    }

    // skeleton variant - card-like skeletons
    return (
        <div className={`space-y-3 ${className ?? ""}`}>
            {Array.from({ length: rows }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
    )
}

export function CardLoadingState({ count = 4 }: { count?: number }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                </div>
            ))}
        </div>
    )
}

export function TableLoadingState({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-2">
            <div className="flex gap-4 pb-2 border-b">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 py-3 border-b border-muted/50">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    )
}
