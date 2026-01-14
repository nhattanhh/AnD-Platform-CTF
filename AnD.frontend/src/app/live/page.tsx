"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield, Trophy, ArrowLeft, RefreshCw, Users, Swords, Target, Medal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api/client"
import type { Game, ScoreboardEntry } from "@/lib/types"

function getRankDisplay(rank: number) {
    if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-muted-foreground">#{rank}</span>
}

export default function LiveScoreboardPage() {
    const [games, setGames] = useState<Game[]>([])
    const [selectedGameId, setSelectedGameId] = useState<string>("")
    const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        async function fetchGames() {
            try {
                const response = await api.games.list()
                const activeGames = response.games.filter(
                    g => g.status === "running" || g.status === "paused" || g.status === "finished"
                )
                setGames(activeGames)
                const runningGame = activeGames.find(g => g.status === "running")
                if (runningGame) {
                    setSelectedGameId(runningGame.id)
                } else if (activeGames.length > 0) {
                    setSelectedGameId(activeGames[0].id)
                }
            } catch (error) {
                console.error("Failed to fetch games:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchGames()
    }, [])

    useEffect(() => {
        if (!selectedGameId) return

        async function fetchScoreboard() {
            try {
                setIsRefreshing(true)
                const data = await api.scoreboard.get(selectedGameId)
                setScoreboard(data.entries || [])
            } catch (error) {
                console.error("Failed to fetch scoreboard:", error)
                setScoreboard([])
            } finally {
                setIsRefreshing(false)
            }
        }
        fetchScoreboard()
        const interval = setInterval(fetchScoreboard, 30000)
        return () => clearInterval(interval)
    }, [selectedGameId])

    const selectedGame = games.find(g => g.id === selectedGameId)

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Shield className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold">AnD Platform</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Sign In</Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Trophy className="h-6 w-6" />
                            Live Scoreboard
                        </h1>
                        <p className="text-sm text-muted-foreground">Real-time competition standings</p>
                    </div>
                </div>

                {/* Game Selector */}
                <div className="flex items-center gap-4 mb-6">
                    <Select value={selectedGameId} onValueChange={setSelectedGameId}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select a game" />
                        </SelectTrigger>
                        <SelectContent>
                            {games.length === 0 ? (
                                <SelectItem value="none" disabled>No games available</SelectItem>
                            ) : (
                                games.map((game) => (
                                    <SelectItem key={game.id} value={game.id}>
                                        {game.name}
                                        {game.status === "running" && " (LIVE)"}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={() => setSelectedGameId(selectedGameId)} disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    </Button>

                    {selectedGame && (
                        <div className="flex items-center gap-3 ml-auto">
                            <Badge variant={selectedGame.status === "running" ? "default" : "secondary"}>
                                {selectedGame.status.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Tick: {selectedGame.current_tick}
                                {selectedGame.max_ticks && ` / ${selectedGame.max_ticks}`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Scoreboard */}
                <Card>
                    <CardHeader>
                        <CardTitle>Standings</CardTitle>
                        <CardDescription>
                            {scoreboard.length} team{scoreboard.length !== 1 ? "s" : ""} competing
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : scoreboard.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                                <h3 className="font-semibold mb-1">No Scores Yet</h3>
                                <p className="text-sm text-muted-foreground">
                                    {games.length === 0 ? "No active games at the moment." : "The competition hasn't started scoring yet."}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[60px]">Rank</TableHead>
                                        <TableHead>Team</TableHead>
                                        <TableHead className="text-center">Attack</TableHead>
                                        <TableHead className="text-center">Defense</TableHead>
                                        <TableHead className="text-center">SLA</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {scoreboard.map((entry, index) => (
                                        <TableRow key={entry.team_id}>
                                            <TableCell className="font-medium">
                                                {getRankDisplay(entry.rank || index + 1)}
                                            </TableCell>
                                            <TableCell className="font-semibold">{entry.team_id}</TableCell>
                                            <TableCell className="text-center">
                                                <span className="flex items-center justify-center gap-1">
                                                    <Swords className="h-4 w-4 text-muted-foreground" />
                                                    {entry.attack_points}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="flex items-center justify-center gap-1">
                                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                                    {entry.defense_points}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="flex items-center justify-center gap-1">
                                                    <Target className="h-4 w-4 text-muted-foreground" />
                                                    {entry.sla_points}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">{entry.total_points}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Legend */}
                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Swords className="h-4 w-4" /> Attack</span>
                    <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> Defense</span>
                    <span className="flex items-center gap-1"><Target className="h-4 w-4" /> SLA</span>
                </div>
            </div>
        </div>
    )
}
