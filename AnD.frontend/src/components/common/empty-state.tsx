import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    children?: ReactNode
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    children,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon className="mb-3 size-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">{title}</h3>
            {description && (
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
            )}
            {action && (
                <Button
                    variant="link"
                    size="sm"
                    onClick={action.onClick}
                    className="mt-2"
                >
                    {action.label}
                </Button>
            )}
            {children}
        </div>
    )
}
