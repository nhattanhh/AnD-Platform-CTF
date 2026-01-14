"use client"

import { useState, useEffect, useMemo } from "react"
import { Trophy, Swords, Shield, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader, EmptyState, LoadingState, RankBadge } from "@/components/common"
import { useScoreboard, useScoreboardGames } from "@/hooks/use-scoreboard"
import { api } from "@/lib/api/client"
import type { Team } from "@/lib/types"

export default function ScoreboardPage() {
  const { games, isLoading: gamesLoading, refresh: refreshGames } = useScoreboardGames()
  const [selectedGameId, setSelectedGameId] = useState<string>("")
  const [teams, setTeams] = useState<Team[]>([])

  // Set default game when games load
  useEffect(() => {
    if (games.length > 0 && !selectedGameId) {
      setSelectedGameId(games[0].id)
    }
  }, [games, selectedGameId])

  // Fetch teams for name mapping
  useEffect(() => {
    async function fetchTeams() {
      try {
        const teamList = await api.teams.list()
        setTeams(teamList)
      } catch (err) {
        console.error("Failed to fetch teams:", err)
      }
    }
    fetchTeams()
  }, [])

  // Create team ID to name mapping
  const teamNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const team of teams) {
      map[team.id] = team.name
    }
    return map
  }, [teams])

  const { scoreboard, isLoading, isRefreshing, refresh: refreshScoreboard } = useScoreboard(selectedGameId, {
    enabled: !!selectedGameId,
  })

  // Combined refresh function
  const handleRefresh = async () => {
    await Promise.all([refreshGames(), refreshScoreboard()])
  }

  if (gamesLoading) {
    return <LoadingState variant="spinner" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scoreboard"
        description="Live rankings and team scores"
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        actions={
          <Select value={selectedGameId} onValueChange={setSelectedGameId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a game" />
            </SelectTrigger>
            <SelectContent>
              {games.map((game) => (
                <SelectItem key={game.id} value={game.id}>
                  {game.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {!selectedGameId ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Trophy}
              title="Select a Game"
              description="Choose a game to view its scoreboard"
            />
          </CardContent>
        </Card>
      ) : isLoading ? (
        <LoadingState variant="spinner" />
      ) : scoreboard ? (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Game</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{scoreboard.game_name}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Tick</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-xl font-bold">{scoreboard.current_tick}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {scoreboard.last_updated
                    ? new Date(scoreboard.last_updated).toLocaleString()
                    : "Never"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rankings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Rankings</CardTitle>
              <CardDescription>
                {scoreboard.entries.length} team{scoreboard.entries.length !== 1 ? "s" : ""} competing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scoreboard.entries.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="No scores yet"
                  description="The game hasn't started or no teams have scored"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Rank</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-right">
                        <span className="flex items-center justify-end gap-1">
                          <Swords className="size-4" />
                          Attack
                        </span>
                      </TableHead>
                      <TableHead className="text-right">
                        <span className="flex items-center justify-end gap-1">
                          <Shield className="size-4" />
                          Defense
                        </span>
                      </TableHead>
                      <TableHead className="text-right">SLA</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Flags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scoreboard.entries.map((entry) => (
                      <TableRow key={entry.team_id}>
                        <TableCell>
                          <RankBadge rank={entry.rank} />
                        </TableCell>
                        <TableCell className="font-medium">{teamNameMap[entry.team_id] || entry.team_id}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-500">
                          +{entry.attack_points}
                        </TableCell>
                        <TableCell className="text-right font-mono text-red-500">
                          -{entry.defense_points}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.sla_points}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {entry.total_points}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          <span className="text-emerald-500">↑{entry.flags_captured}</span>
                          {" / "}
                          <span className="text-red-500">↓{entry.flags_lost}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
