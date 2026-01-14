"use client"

import { useState, useEffect } from "react"
import { Send, Trophy, Activity, CheckCircle, XCircle, AlertCircle, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SubmissionStatusBadge, EmptyState } from "@/components/common"
import { useSubmissions, useSubmitFlag } from "@/hooks/use-submissions"
import { formatTime, getSubmissionStatusColor } from "@/lib/utils"
import { api } from "@/lib/api/client"
import type { User } from "@/lib/types/auth"
import type { SubmissionStatus, Game } from "@/lib/types"

function getSubmissionStatusIcon(status: SubmissionStatus) {
    switch (status) {
        case "accepted":
            return <CheckCircle className="size-4 text-emerald-500" />
        case "rejected":
        case "invalid":
            return <XCircle className="size-4 text-red-500" />
        case "duplicate":
        case "own_flag":
            return <AlertCircle className="size-4 text-amber-500" />
        case "expired":
            return <Clock className="size-4 text-slate-500" />
        default:
            return null
    }
}

interface TeamDashboardProps {
    user: User | null
}

export function TeamDashboard({ user }: TeamDashboardProps) {
    const { submissions, isLoading, refresh } = useSubmissions({ limit: 10 })
    const { submit, isSubmitting } = useSubmitFlag()
    const [flagInput, setFlagInput] = useState("")
    const [currentGame, setCurrentGame] = useState<Game | null>(null)

    // Fetch the current running game that user's team is participating in
    useEffect(() => {
        async function fetchCurrentGame() {
            if (!user?.teamId) {
                setCurrentGame(null)
                return
            }

            try {
                const response = await api.games.list()
                const runningGame = response.games.find((g) => g.status === "running")

                if (runningGame) {
                    // Check if user's team is actually in this game
                    try {
                        const teams = await api.games.teams.list(runningGame.id)
                        const isInGame = teams.some(t => t.team_id === user.teamId)
                        setCurrentGame(isInGame ? runningGame : null)
                    } catch {
                        // If we can't fetch teams, don't show the game
                        setCurrentGame(null)
                    }
                } else {
                    setCurrentGame(null)
                }
            } catch (error) {
                console.error("Failed to fetch games:", error)
                setCurrentGame(null)
            }
        }
        fetchCurrentGame()
    }, [user?.teamId])

    async function handleSubmitFlag() {
        if (!currentGame) {
            toast.error("No game is currently running")
            return
        }
        const result = await submit(flagInput, currentGame.id)
        if (result) {
            setFlagInput("")
            refresh()
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome, {user?.displayName || user?.username}
                </h1>
                <p className="text-muted-foreground">Team Dashboard</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Flag Submission Card */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="size-5" />
                            Submit Flag
                        </CardTitle>
                        <CardDescription>
                            {currentGame
                                ? `Capture and submit enemy flags to earn points (${currentGame.name})`
                                : "No game is currently running"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="flag">Flag</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="flag"
                                    placeholder="FLAG{...}"
                                    value={flagInput}
                                    onChange={(e) => setFlagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSubmitFlag()}
                                    className="font-mono"
                                    disabled={!currentGame}
                                />
                                <Button
                                    onClick={handleSubmitFlag}
                                    disabled={isSubmitting || !currentGame}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Send className="size-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="size-5" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <Button variant="outline" className="justify-start" asChild>
                            <Link href="/scoreboard">
                                <Trophy className="mr-2 size-4" />
                                View Scoreboard
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                            <Link href="/submissions">
                                <Activity className="mr-2 size-4" />
                                All Submissions
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Submissions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Submissions</CardTitle>
                    <CardDescription>Your latest flag submission attempts</CardDescription>
                </CardHeader>
                <CardContent>
                    {submissions.length === 0 ? (
                        <EmptyState
                            icon={Send}
                            title="No submissions yet"
                            description="Capture some flags!"
                        />
                    ) : (
                        <div className="space-y-3">
                            {submissions.slice(0, 5).map((submission) => (
                                <div
                                    key={submission.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        {getSubmissionStatusIcon(submission.status)}
                                        <div>
                                            <p className="font-mono text-sm truncate max-w-[200px]">
                                                {submission.submitted_flag}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatTime(submission.submitted_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <SubmissionStatusBadge status={submission.status} />
                                        {submission.points > 0 && (
                                            <span className="text-emerald-500 font-medium text-sm">
                                                +{submission.points}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
