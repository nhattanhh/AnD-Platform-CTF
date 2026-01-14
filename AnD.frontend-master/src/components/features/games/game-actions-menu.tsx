"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Play, Pause, Square, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteConfirmDialog } from "@/components/common"
import type { Game } from "@/lib/types"
import type { useGameMutations } from "@/hooks/use-games"

interface GameActionsMenuProps {
    game: Game
    mutations: ReturnType<typeof useGameMutations>
    onSuccess?: () => void
}

export function GameActionsMenu({ game, mutations, onSuccess }: GameActionsMenuProps) {
    const [actionLoading, setActionLoading] = useState(false)

    function handleStart() {
        // Show immediate feedback - don't wait for the request
        toast.loading("Starting game...", { id: `start-${game.id}` })

        // Fire the request in the background
        // Note: hooks already show error toast with specific message, so we only show success here
        mutations.start(game.id).then((success) => {
            if (success) {
                toast.success("Game started successfully", { id: `start-${game.id}` })
            } else {
                // Dismiss loading toast - hook already showed the error
                toast.dismiss(`start-${game.id}`)
            }
            onSuccess?.()
        })
    }

    function handlePause() {
        toast.loading("Pausing game...", { id: `pause-${game.id}` })

        mutations.pause(game.id).then((success) => {
            if (success) {
                toast.success("Game paused", { id: `pause-${game.id}` })
            } else {
                toast.dismiss(`pause-${game.id}`)
            }
            onSuccess?.()
        })
    }

    function handleStop() {
        toast.loading("Stopping game...", { id: `stop-${game.id}` })

        mutations.stop(game.id).then((success) => {
            if (success) {
                toast.success("Game stopped", { id: `stop-${game.id}` })
            } else {
                toast.dismiss(`stop-${game.id}`)
            }
            onSuccess?.()
        })
    }

    async function handleDelete() {
        await mutations.remove(game.id)
        onSuccess?.()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={actionLoading}>
                    {actionLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <MoreHorizontal className="size-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/games/${game.id}`}>
                        View Details
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {game.status === "draft" && (
                    <DropdownMenuItem onClick={handleStart}>
                        <Play className="mr-2 size-4" />
                        Start Game
                    </DropdownMenuItem>
                )}
                {game.status === "running" && (
                    <DropdownMenuItem onClick={handlePause}>
                        <Pause className="mr-2 size-4" />
                        Pause Game
                    </DropdownMenuItem>
                )}
                {game.status === "paused" && (
                    <DropdownMenuItem onClick={handleStart}>
                        <Play className="mr-2 size-4" />
                        Resume Game
                    </DropdownMenuItem>
                )}
                {(game.status === "running" || game.status === "paused") && (
                    <DropdownMenuItem onClick={handleStop}>
                        <Square className="mr-2 size-4" />
                        Stop Game
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive"
                    onSelect={(e) => e.preventDefault()}
                >
                    <DeleteConfirmDialog
                        trigger={
                            <span className="flex items-center w-full">
                                <Trash2 className="mr-2 size-4" />
                                Delete
                            </span>
                        }
                        itemName={game.name}
                        itemType="Game"
                        onConfirm={handleDelete}
                    />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
