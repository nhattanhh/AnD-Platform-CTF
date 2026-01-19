"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { api } from "@/lib/api/client"
import type { ScoreboardResponse, ScoreboardEntry } from "@/lib/types"

interface WebSocketMessage {
    type: "initial" | "scoreboard_update" | "error"
    game_id?: string
    team_id?: string
    operation?: string
    timestamp?: number
    entries?: ScoreboardEntry[]
    message?: string
}

interface UseScoreboardWSOptions {
    enabled?: boolean
    onUpdate?: (data: WebSocketMessage) => void
}

interface UseScoreboardWSReturn {
    scoreboard: ScoreboardResponse | null
    isLoading: boolean
    isConnected: boolean
    error: Error | null
    refresh: () => Promise<void>
}

export function useScoreboardWS(
    gameId: string | null,
    options: UseScoreboardWSOptions = {}
): UseScoreboardWSReturn {
    const { enabled = true, onUpdate } = options
    const [scoreboard, setScoreboard] = useState<ScoreboardResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Fetch full scoreboard data
    const fetchScoreboard = useCallback(async () => {
        if (!gameId) {
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            const data = await api.scoreboard.get(gameId)
            setScoreboard(data)
            setError(null)
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to fetch scoreboard")
            setError(error)
        } finally {
            setIsLoading(false)
        }
    }, [gameId])

    // Connect to WebSocket
    useEffect(() => {
        if (!gameId || !enabled) {
            setIsLoading(false)
            return
        }

        let isMounted = true

        const connect = () => {
            // Determine WebSocket URL based on platform API
            const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
            const wsUrl = `${wsProtocol}//localhost:8000/ws/scoreboard/${gameId}`

            console.log(`[WS] Connecting to ${wsUrl}`)

            const ws = new WebSocket(wsUrl)
            wsRef.current = ws

            ws.onopen = () => {
                if (!isMounted) return
                console.log("[WS] Connected")
                setIsConnected(true)
                setError(null)

                // Start ping interval
                pingIntervalRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send("ping")
                    }
                }, 30000)
            }

            ws.onmessage = (event) => {
                if (!isMounted) return

                try {
                    const data: WebSocketMessage = JSON.parse(event.data)
                    console.log("[WS] Message received:", data.type)

                    if (data.type === "initial" && data.entries) {
                        // Initial scoreboard data from WebSocket
                        setScoreboard(prev => prev ? {
                            ...prev,
                            entries: data.entries!,
                            last_updated: new Date().toISOString()
                        } : {
                            game_id: gameId,
                            game_name: "",
                            current_tick: 0,
                            last_updated: new Date().toISOString(),
                            entries: data.entries!
                        })
                        setIsLoading(false)
                    } else if (data.type === "scoreboard_update") {
                        // Score updated - refresh full scoreboard
                        console.log("[WS] Scoreboard update detected, refreshing...")
                        fetchScoreboard()
                        onUpdate?.(data)
                    } else if (data.type === "error") {
                        console.error("[WS] Server error:", data.message)
                    }
                } catch (e) {
                    // Ignore non-JSON messages (like "pong")
                }
            }

            ws.onerror = (event) => {
                if (!isMounted) return
                console.error("[WS] Error:", event)
                setError(new Error("WebSocket connection error"))
            }

            ws.onclose = (event) => {
                if (!isMounted) return
                console.log("[WS] Disconnected:", event.code, event.reason)
                setIsConnected(false)

                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current)
                }

                // Reconnect after 3 seconds if not intentionally closed
                if (event.code !== 1000) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (isMounted) {
                            console.log("[WS] Attempting reconnect...")
                            connect()
                        }
                    }, 3000)
                }
            }
        }

        // Initial fetch then connect
        fetchScoreboard().then(() => {
            if (isMounted) {
                connect()
            }
        })

        return () => {
            isMounted = false

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current)
            }
            if (wsRef.current) {
                wsRef.current.close(1000, "Component unmounted")
                wsRef.current = null
            }
        }
    }, [gameId, enabled, fetchScoreboard, onUpdate])

    return {
        scoreboard,
        isLoading,
        isConnected,
        error,
        refresh: fetchScoreboard,
    }
}
