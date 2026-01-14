"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api/client"
import type { ScoreboardResponse } from "@/lib/types"

interface UseScoreboardOptions {
    enabled?: boolean
}

interface UseScoreboardReturn {
    scoreboard: ScoreboardResponse | null
    isLoading: boolean
    isRefreshing: boolean
    error: Error | null
    refresh: () => Promise<void>
}

export function useScoreboard(
    gameId: string | null,
    options: UseScoreboardOptions = {}
): UseScoreboardReturn {
    const { enabled = true } = options
    const [scoreboard, setScoreboard] = useState<ScoreboardResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchScoreboard = useCallback(async (isRefresh = false) => {
        if (!gameId || !enabled) {
            setIsLoading(false)
            return
        }

        try {
            if (isRefresh) setIsRefreshing(true)
            else setIsLoading(true)

            const data = await api.scoreboard.get(gameId)
            setScoreboard(data)
            setError(null)
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to fetch scoreboard")
            setError(error)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [gameId, enabled])

    useEffect(() => {
        fetchScoreboard()
    }, [fetchScoreboard])



    return {
        scoreboard,
        isLoading,
        isRefreshing,
        error,
        refresh: () => fetchScoreboard(true),
    }
}

interface GameOption {
    id: string
    name: string
    currentTick: number
    status: string
}

interface UseScoreboardGamesReturn {
    games: GameOption[]
    isLoading: boolean
    error: Error | null
    refresh: () => Promise<void>
}

export function useScoreboardGames(): UseScoreboardGamesReturn {
    const [games, setGames] = useState<GameOption[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    async function fetchGames() {
        try {
            setIsLoading(true)
            const response = await api.games.list()
            // Map games from the response
            const gameOptions = response.games.map(g => ({
                id: g.id,
                name: g.name,
                currentTick: g.current_tick,
                status: g.status,
            }))
            setGames(gameOptions)
            setError(null)
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to fetch games")
            setError(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchGames()
    }, [])

    return { games, isLoading, error, refresh: fetchGames }
}
