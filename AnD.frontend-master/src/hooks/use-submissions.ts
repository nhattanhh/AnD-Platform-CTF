"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api/client"
import type { SubmissionDetail, SubmissionResponse, SubmissionStatus, FlagSubmit } from "@/lib/types"

interface SubmissionFilters {
    gameId?: string
    teamId?: string
    status?: SubmissionStatus
    limit?: number
}

interface UseSubmissionsReturn {
    submissions: SubmissionDetail[]
    total: number
    isLoading: boolean
    isRefreshing: boolean
    error: Error | null
    refresh: () => Promise<void>
}

export function useSubmissions(filters: SubmissionFilters = {}): UseSubmissionsReturn {
    const { gameId, teamId, status, limit = 50 } = filters
    const [submissions, setSubmissions] = useState<SubmissionDetail[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchSubmissions = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setIsRefreshing(true)
            else setIsLoading(true)

            const response = await api.submissions.list({
                game_id: gameId,
                team_id: teamId,
                status,
                limit,
            })
            setSubmissions(response.items)
            setTotal(response.total)
            setError(null)
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to fetch submissions")
            setError(error)
            if (!isRefresh) toast.error("Failed to fetch submissions")
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [gameId, teamId, status, limit])

    useEffect(() => {
        fetchSubmissions()
    }, [fetchSubmissions])

    return {
        submissions,
        total,
        isLoading,
        isRefreshing,
        error,
        refresh: () => fetchSubmissions(true),
    }
}

interface UseSubmitFlagReturn {
    isSubmitting: boolean
    submit: (flag: string, gameId?: string) => Promise<SubmissionResponse | null>
}

export function useSubmitFlag(): UseSubmitFlagReturn {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const submit = async (flag: string, gameId?: string): Promise<SubmissionResponse | null> => {
        if (!flag.trim()) {
            toast.error("Please enter a flag")
            return null
        }

        try {
            setIsSubmitting(true)
            const data: FlagSubmit = { flag }
            if (gameId) data.game_id = gameId

            const result = await api.submissions.submit(data)

            if (result.status === "accepted") {
                toast.success(`Flag accepted! +${result.points} points`, {
                    description: result.message,
                })
            } else {
                toast.error(`Flag ${result.status}`, {
                    description: result.message,
                })
            }

            return result
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to submit flag")
            return null
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        isSubmitting,
        submit,
    }
}
