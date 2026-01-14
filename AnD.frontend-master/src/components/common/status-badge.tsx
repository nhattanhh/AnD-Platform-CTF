import { Badge } from "@/components/ui/badge"
import {
    getGameStatusColor,
    getSubmissionStatusColor,
    getTickStatusColor,
    getCheckStatusColor,
    getRankColor
} from "@/lib/utils"
import type { GameStatus, SubmissionStatus, TickStatus, CheckStatus } from "@/lib/types"

interface GameStatusBadgeProps {
    status: GameStatus
    className?: string
}

export function GameStatusBadge({ status, className }: GameStatusBadgeProps) {
    return (
        <Badge className={`${getGameStatusColor(status)} ${className ?? ""}`}>
            {status}
        </Badge>
    )
}

interface SubmissionStatusBadgeProps {
    status: SubmissionStatus
    className?: string
}

export function SubmissionStatusBadge({ status, className }: SubmissionStatusBadgeProps) {
    return (
        <Badge className={`${getSubmissionStatusColor(status)} ${className ?? ""}`}>
            {status.replace("_", " ")}
        </Badge>
    )
}

interface TickStatusBadgeProps {
    status: TickStatus
    className?: string
}

export function TickStatusBadge({ status, className }: TickStatusBadgeProps) {
    return (
        <Badge className={`${getTickStatusColor(status)} ${className ?? ""}`}>
            {status}
        </Badge>
    )
}

interface CheckStatusBadgeProps {
    status: CheckStatus
    className?: string
}

export function CheckStatusBadge({ status, className }: CheckStatusBadgeProps) {
    return (
        <Badge className={`${getCheckStatusColor(status)} ${className ?? ""}`}>
            {status}
        </Badge>
    )
}

interface RankBadgeProps {
    rank: number
    className?: string
}

export function RankBadge({ rank, className }: RankBadgeProps) {
    const rankColor = getRankColor(rank)
    return (
        <Badge
            variant={rank <= 3 ? "default" : "secondary"}
            className={`${rankColor} ${className ?? ""}`}
        >
            #{rank}
        </Badge>
    )
}

interface ActiveBadgeProps {
    isActive: boolean
    className?: string
}

export function ActiveBadge({ isActive, className }: ActiveBadgeProps) {
    return (
        <Badge variant={isActive ? "default" : "secondary"} className={className}>
            {isActive ? "Active" : "Inactive"}
        </Badge>
    )
}
