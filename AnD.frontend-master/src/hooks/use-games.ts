"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api/client"
import type { Game, GameCreate, GameUpdate, GameTeam, GameTeamAdd } from "@/lib/types"

interface UseGamesOptions {
    autoRefresh?: boolean
    refreshInterval?: number
}

interface UseGamesReturn {
    games: Game[]
    total: number
    isLoading: boolean
    isRefreshing: boolean
    error: Error | null
    refresh: () => Promise<void>
}

export function useGames(options: UseGamesOptions = {}): UseGamesReturn {
    const { autoRefresh = false, refreshInterval = 30000 } = options
    const [games, setGames] = useState<Game[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchGames = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setIsRefreshing(true)
            else setIsLoading(true)

            const response = await api.games.list()
            setGames(response.games)
            setTotal(response.total)
            setError(null)
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to fetch games")
            setError(error)
            if (!isRefresh) toast.error("Failed to fetch games")
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchGames()
    }, [fetchGames])

    useEffect(() => {
        if (!autoRefresh) return
        const interval = setInterval(() => fetchGames(true), refreshInterval)
        return () => clearInterval(interval)
    }, [autoRefresh, refreshInterval, fetchGames])

    return {
        games,
        total,
        isLoading,
        isRefreshing,
        error,
        refresh: () => fetchGames(true),
    }
}

interface UseGameReturn {
    game: Game | null
    teams: GameTeam[]
    isLoading: boolean
    error: Error | null
    refresh: () => Promise<void>
}

export function useGame(gameId: string | null): UseGameReturn {
    const [game, setGame] = useState<Game | null>(null)
    const [teams, setTeams] = useState<GameTeam[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchGame = useCallback(async () => {
        if (!gameId) {
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            const [gameData, teamsData] = await Promise.all([
                api.games.get(gameId),
                api.games.teams.list(gameId),
            ])
            setGame(gameData)
            setTeams(teamsData)
            setError(null)
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to fetch game")
            setError(error)
        } finally {
            setIsLoading(false)
        }
    }, [gameId])

    useEffect(() => {
        fetchGame()
    }, [fetchGame])

    return {
        game,
        teams,
        isLoading,
        error,
        refresh: fetchGame,
    }
}

interface UseGameMutationsReturn {
    isLoading: boolean
    create: (data: GameCreate) => Promise<Game | null>
    update: (gameId: string, data: GameUpdate) => Promise<Game | null>
    remove: (gameId: string) => Promise<boolean>
    start: (gameId: string) => Promise<boolean>
    pause: (gameId: string) => Promise<boolean>
    stop: (gameId: string) => Promise<boolean>
    addTeam: (gameId: string, data: GameTeamAdd) => Promise<GameTeam | null>
    removeTeam: (gameId: string, teamId: string) => Promise<boolean>
    assignVulnbox: (gameId: string, vulnboxId: string) => Promise<Game | null>
    assignChecker: (gameId: string, checkerId: string) => Promise<Game | null>
}

export function useGameMutations(): UseGameMutationsReturn {
    const [isLoading, setIsLoading] = useState(false)

    const create = async (data: GameCreate): Promise<Game | null> => {
        try {
            setIsLoading(true)
            const game = await api.games.create(data)
            toast.success("Game created successfully")
            return game
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create game")
            return null
        } finally {
            setIsLoading(false)
        }
    }

    const update = async (gameId: string, data: GameUpdate): Promise<Game | null> => {
        try {
            setIsLoading(true)
            const game = await api.games.update(gameId, data)
            toast.success("Game updated successfully")
            return game
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update game")
            return null
        } finally {
            setIsLoading(false)
        }
    }

    const remove = async (gameId: string): Promise<boolean> => {
        try {
            setIsLoading(true)
            await api.games.delete(gameId)
            toast.success("Game deleted successfully")
            return true
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete game")
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const start = async (gameId: string): Promise<boolean> => {
        try {
            setIsLoading(true)
            await api.games.start(gameId)
            toast.success("Game started")
            return true
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to start game")
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const pause = async (gameId: string): Promise<boolean> => {
        try {
            setIsLoading(true)
            await api.games.pause(gameId)
            toast.success("Game paused")
            return true
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to pause game")
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const stop = async (gameId: string): Promise<boolean> => {
        try {
            setIsLoading(true)
            await api.games.stop(gameId)
            toast.success("Game stopped")
            return true
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to stop game")
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const addTeam = async (gameId: string, data: GameTeamAdd): Promise<GameTeam | null> => {
        try {
            setIsLoading(true)
            const team = await api.games.teams.add(gameId, data)
            toast.success("Team added to game")
            return team
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to add team")
            return null
        } finally {
            setIsLoading(false)
        }
    }

    const removeTeam = async (gameId: string, teamId: string): Promise<boolean> => {
        try {
            setIsLoading(true)
            await api.games.teams.remove(gameId, teamId)
            toast.success("Team removed from game")
            return true
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to remove team")
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const assignVulnbox = async (gameId: string, vulnboxId: string): Promise<Game | null> => {
        try {
            setIsLoading(true)
            const game = await api.games.assignVulnbox(gameId, vulnboxId)
            toast.success("Vulnbox assigned")
            return game
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to assign vulnbox")
            return null
        } finally {
            setIsLoading(false)
        }
    }

    const assignChecker = async (gameId: string, checkerId: string): Promise<Game | null> => {
        try {
            setIsLoading(true)
            const game = await api.games.assignChecker(gameId, checkerId)
            toast.success("Checker assigned")
            return game
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to assign checker")
            return null
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        create,
        update,
        remove,
        start,
        pause,
        stop,
        addTeam,
        removeTeam,
        assignVulnbox,
        assignChecker,
    }
}
