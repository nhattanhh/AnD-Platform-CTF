"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api/client"
import type { Team, CreateTeamRequest, TeamCreateResponse } from "@/lib/types/auth"

interface UseTeamsReturn {
    teams: Team[]
    isLoading: boolean
    isRefreshing: boolean
    error: Error | null
    refresh: () => Promise<void>
}

export function useTeams(): UseTeamsReturn {
    const [teams, setTeams] = useState<Team[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchTeams = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setIsRefreshing(true)
            else setIsLoading(true)

            const response = await api.teams.list()
            setTeams(response)
            setError(null)
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to fetch teams")
            setError(error)
            if (!isRefresh) toast.error("Failed to fetch teams")
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchTeams()
    }, [fetchTeams])

    return {
        teams,
        isLoading,
        isRefreshing,
        error,
        refresh: () => fetchTeams(true),
    }
}

interface UseTeamMutationsReturn {
    isLoading: boolean
    create: (data: CreateTeamRequest) => Promise<TeamCreateResponse | null>
    update: (teamId: string, data: Partial<Team>) => Promise<Team | null>
    remove: (teamId: string) => Promise<boolean>
}

export function useTeamMutations(): UseTeamMutationsReturn {
    const [isLoading, setIsLoading] = useState(false)

    const create = async (data: CreateTeamRequest): Promise<TeamCreateResponse | null> => {
        try {
            setIsLoading(true)
            const team = await api.teams.create(data)
            toast.success("Team created successfully")
            return team
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create team")
            return null
        } finally {
            setIsLoading(false)
        }
    }

    const update = async (teamId: string, data: Partial<Team>): Promise<Team | null> => {
        try {
            setIsLoading(true)
            const team = await api.teams.update(teamId, data)
            toast.success("Team updated successfully")
            return team
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update team")
            return null
        } finally {
            setIsLoading(false)
        }
    }

    const remove = async (teamId: string): Promise<boolean> => {
        try {
            setIsLoading(true)
            await api.teams.delete(teamId)
            toast.success("Team deleted")
            return true
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete team")
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        create,
        update,
        remove,
    }
}
