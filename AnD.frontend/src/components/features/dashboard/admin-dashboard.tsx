"use client"

import Link from "next/link"
import {
    Gamepad2,
    Shield,
    Bug,
    Trophy,
    Plus,
    PlayCircle,
    Upload,
    Activity,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader, LoadingState, EmptyState, GameStatusBadge } from "@/components/common"
import { useGames } from "@/hooks/use-games"
import { useVulnboxes, useCheckers } from "@/hooks/use-resources"

export function AdminDashboard() {
    const { games, total: totalGames, isLoading: gamesLoading } = useGames()
    const { total: totalVulnboxes, isLoading: vulnboxesLoading } = useVulnboxes()
    const { total: totalCheckers, isLoading: checkersLoading } = useCheckers()

    const isLoading = gamesLoading || vulnboxesLoading || checkersLoading
    const runningGames = games.filter((g) => g.status === "running").length
    const recentGames = games.slice(0, 5)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome to the Attack-Defense CTF Platform
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/games">
                            <Plus className="mr-2 size-4" />
                            New Game
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Games</CardTitle>
                        <Gamepad2 className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "-" : totalGames}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {runningGames} currently running
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vulnboxes</CardTitle>
                        <Shield className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "-" : totalVulnboxes}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Docker images available
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Checkers</CardTitle>
                        <Bug className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "-" : totalCheckers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            SLA check scripts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Games</CardTitle>
                        <Activity className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "-" : runningGames}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Games in progress
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Games & Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Games</CardTitle>
                        <CardDescription>Latest games in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {gamesLoading ? (
                            <LoadingState variant="skeleton" rows={3} />
                        ) : recentGames.length === 0 ? (
                            <EmptyState
                                icon={Gamepad2}
                                title="No games yet"
                                action={{ label: "Create your first game", onClick: () => { } }}
                            />
                        ) : (
                            <div className="space-y-3">
                                {recentGames.map((game) => (
                                    <Link
                                        key={game.id}
                                        href={`/games/${game.id}`}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div>
                                            <p className="font-medium">{game.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Tick {game.current_tick} • {game.tick_duration_seconds}s intervals
                                            </p>
                                        </div>
                                        <GameStatusBadge status={game.status} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common operations</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <Button variant="outline" className="justify-start" asChild>
                            <Link href="/games">
                                <PlayCircle className="mr-2 size-4" />
                                Create New Game
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                            <Link href="/vulnboxes">
                                <Upload className="mr-2 size-4" />
                                Upload Vulnbox
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                            <Link href="/checkers">
                                <Bug className="mr-2 size-4" />
                                Upload Checker
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                            <Link href="/scoreboard">
                                <Trophy className="mr-2 size-4" />
                                View Scoreboard
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
