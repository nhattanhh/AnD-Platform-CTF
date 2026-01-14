import { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
    title: string
    description?: string
    backHref?: string
    actions?: ReactNode
    isRefreshing?: boolean
    onRefresh?: () => void
}

export function PageHeader({
    title,
    description,
    backHref,
    actions,
    isRefreshing,
    onRefresh,
}: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                {backHref && (
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={backHref}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                )}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-muted-foreground">{description}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {onRefresh && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    </Button>
                )}
                {actions}
            </div>
        </div>
    )
}
