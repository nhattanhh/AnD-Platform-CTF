import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
    size?: number
}

export function Spinner({ size = 24, className, ...props }: SpinnerProps) {
    return (
        <Loader2
            className={cn("animate-spin text-primary", className)}
            size={size}
            {...props}
        />
    )
}
