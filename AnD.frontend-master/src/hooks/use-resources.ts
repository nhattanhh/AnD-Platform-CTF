"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api/client"
import type { Vulnbox, Checker } from "@/lib/types"

// ============================================
// Vulnboxes Hook
// ============================================

interface UseVulnboxesReturn {
    vulnboxes: Vulnbox[]
    total: number
    isLoading: boolean
    isRefreshing: boolean
    error: Error | null
    refresh: () => Promise<void>
}

export function useVulnboxes(): UseVulnboxesReturn {
    const [vulnboxes, setVulnboxes] = useState<Vulnbox[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchVulnboxes = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setIsRefreshing(true)
            else setIsLoading(true)

            const response = await api.vulnboxes.list()
            setVulnboxes(response.items)
            setTotal(response.total)
            setError(null)
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to fetch vulnboxes")
            setError(error)
            if (!isRefresh) toast.error("Failed to fetch vulnboxes")
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchVulnboxes()
    }, [fetchVulnboxes])

    return {
        vulnboxes,
        total,
        isLoading,
        isRefreshing,
        error,
        refresh: () => fetchVulnboxes(true),
    }
}

interface UseVulnboxMutationsReturn {
    isLoading: boolean
    uploadProgress: number
    create: (name: string, file: File, description?: string) => Promise<Vulnbox | null>
    remove: (vulnboxId: string) => Promise<boolean>
}

export function useVulnboxMutations(): UseVulnboxMutationsReturn {
    const [isLoading, setIsLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const create = async (name: string, file: File, description?: string): Promise<Vulnbox | null> => {
        try {
            setIsLoading(true)
            setUploadProgress(0)
            // Simulate progress since fetch doesn't support upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90))
            }, 200)

            const vulnbox = await api.vulnboxes.create(name, file, description)
            clearInterval(progressInterval)
            setUploadProgress(100)
            toast.success("Vulnbox uploaded successfully")
            return vulnbox
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to upload vulnbox")
            return null
        } finally {
            setIsLoading(false)
            setUploadProgress(0)
        }
    }

    const remove = async (vulnboxId: string): Promise<boolean> => {
        try {
            setIsLoading(true)
            await api.vulnboxes.delete(vulnboxId)
            toast.success("Vulnbox deleted")
            return true
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete vulnbox")
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        uploadProgress,
        create,
        remove,
    }
}

// ============================================
// Checkers Hook
// ============================================

interface UseCheckersReturn {
    checkers: Checker[]
    total: number
    isLoading: boolean
    isRefreshing: boolean
    error: Error | null
    refresh: () => Promise<void>
}

export function useCheckers(): UseCheckersReturn {
    const [checkers, setCheckers] = useState<Checker[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchCheckers = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setIsRefreshing(true)
            else setIsLoading(true)

            const response = await api.checkers.list()
            setCheckers(response.items)
            setTotal(response.total)
            setError(null)
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to fetch checkers")
            setError(error)
            if (!isRefresh) toast.error("Failed to fetch checkers")
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchCheckers()
    }, [fetchCheckers])

    return {
        checkers,
        total,
        isLoading,
        isRefreshing,
        error,
        refresh: () => fetchCheckers(true),
    }
}

interface UseCheckerMutationsReturn {
    isLoading: boolean
    uploadProgress: number
    create: (name: string, file: File, description?: string) => Promise<Checker | null>
    remove: (checkerId: string) => Promise<boolean>
}

export function useCheckerMutations(): UseCheckerMutationsReturn {
    const [isLoading, setIsLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const create = async (name: string, file: File, description?: string): Promise<Checker | null> => {
        try {
            setIsLoading(true)
            setUploadProgress(0)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90))
            }, 200)

            const checker = await api.checkers.create(name, file, description)
            clearInterval(progressInterval)
            setUploadProgress(100)
            toast.success("Checker uploaded successfully")
            return checker
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to upload checker")
            return null
        } finally {
            setIsLoading(false)
            setUploadProgress(0)
        }
    }

    const remove = async (checkerId: string): Promise<boolean> => {
        try {
            setIsLoading(true)
            await api.checkers.delete(checkerId)
            toast.success("Checker deleted")
            return true
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete checker")
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        uploadProgress,
        create,
        remove,
    }
}
