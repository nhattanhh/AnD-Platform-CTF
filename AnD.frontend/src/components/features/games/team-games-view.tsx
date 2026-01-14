"use client"

import { useEffect, useState } from "react"
import { Gamepad2, Clock, Server, Terminal, Check, Copy, Eye, EyeOff, Key } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingState, EmptyState, CopyField } from "@/components/common"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api/client"
import type { GameTeam } from "@/lib/types"

interface GameInfo {
    id: string
    name: string
    currentTick: number
}

export function TeamGamesView() {
    const { user } = useAuth()
    const [games, setGames] = useState<GameInfo[]>([])
    const [teamInfo, setTeamInfo] = useState<Record<string, GameTeam | null>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
    const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({})

    useEffect(() => {
        async function fetchGames() {
            if (!user || !user.teamId) {
                setIsLoading(false)
                return
            }

            try {
                // Fetch all games
                const gamesResponse = await api.games.list()
                console.log("Games response:", gamesResponse)

                // Filter to only running/paused games (active games)
                const activeGames = gamesResponse.games.filter(
                    g => g.status === "running" || g.status === "paused"
                )

                const gameList = activeGames.map(g => ({
                    id: g.id,
                    name: g.name,
                    currentTick: g.current_tick,
                }))
                setGames(gameList)

                // Fetch team info for each game using user's teamId
                const teamInfoMap: Record<string, GameTeam | null> = {}
                for (const game of gameList) {
                    try {
                        const teamData = await api.games.teams.get(game.id, user.teamId)
                        teamInfoMap[game.id] = teamData
                    } catch {
                        // Team not assigned to this game
                        teamInfoMap[game.id] = null
                    }
                }
                setTeamInfo(teamInfoMap)
            } catch (error) {
                console.error("Failed to fetch games:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchGames()
    }, [user])

    async function copyToClipboard(text: string, field: string) {
        await navigator.clipboard.writeText(text)
        setCopiedFields(prev => ({ ...prev, [field]: true }))
        setTimeout(() => setCopiedFields(prev => ({ ...prev, [field]: false })), 2000)
    }

    if (isLoading) {
        return <LoadingState variant="spinner" />
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Games</h1>
                <p className="text-muted-foreground">
                    Games you are participating in
                </p>
            </div>

            {!user?.teamId ? (
                <Card>
                    <CardContent>
                        <EmptyState
                            icon={Gamepad2}
                            title="No team assigned"
                            description="You are not assigned to any team yet. Contact your admin or teacher."
                        />
                    </CardContent>
                </Card>
            ) : games.length === 0 ? (
                <Card>
                    <CardContent>
                        <EmptyState
                            icon={Gamepad2}
                            title="No active games"
                            description="There are no running games at the moment"
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {games.map((game) => {
                        const team = teamInfo[game.id]
                        const isParticipating = team !== null
                        return (
                            <Card
                                key={game.id}
                                className={isParticipating
                                    ? "border-emerald-500/50 ring-1 ring-emerald-500/20 bg-emerald-500/5"
                                    : ""
                                }
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Gamepad2 className="size-5" />
                                            {game.name}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            {isParticipating && (
                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                    <Check className="mr-1 size-3" />
                                                    Participating
                                                </Badge>
                                            )}
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                <Clock className="mr-1 size-3" />
                                                Tick {game.currentTick}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {team ? (
                                        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Server className="size-4" />
                                                Connection Details
                                            </h4>

                                            {team.container_ip && (
                                                <CopyField
                                                    label="Container IP"
                                                    value={team.container_ip}
                                                    mono
                                                />
                                            )}

                                            {team.ssh_username && (
                                                <CopyField
                                                    label="SSH Username"
                                                    value={team.ssh_username}
                                                    mono
                                                />
                                            )}

                                            {team.ssh_password && (
                                                <CopyField
                                                    label="SSH Password"
                                                    value={team.ssh_password}
                                                    mono
                                                    hidden
                                                />
                                            )}

                                            {team.ssh_port && (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">SSH Port</p>
                                                        <p className="font-mono text-sm">{team.ssh_port}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {team.container_ip && team.ssh_username && team.ssh_port && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-xs text-muted-foreground mb-1">Quick Connect</p>
                                                    <div className="flex items-center gap-2">
                                                        <code className="text-xs bg-background rounded px-2 py-1 flex-1 overflow-x-auto">
                                                            ssh {team.ssh_username}@{team.container_ip} -p {team.ssh_port}
                                                        </code>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => copyToClipboard(
                                                                `ssh ${team.ssh_username}@${team.container_ip} -p ${team.ssh_port}`,
                                                                `ssh-${game.id}`
                                                            )}
                                                        >
                                                            {copiedFields[`ssh-${game.id}`] ? (
                                                                <Check className="size-4 text-emerald-500" />
                                                            ) : (
                                                                <Terminal className="size-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-muted-foreground">
                                            <Key className="mx-auto size-8 mb-2 opacity-50" />
                                            <p className="text-sm">Not yet assigned to this game</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
