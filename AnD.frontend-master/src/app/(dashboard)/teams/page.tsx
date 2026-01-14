"use client"

import { useState } from "react"
import { Users, Plus } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PageHeader, EmptyState, LoadingState, DeleteConfirmDialog } from "@/components/common"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useTeams, useTeamMutations } from "@/hooks/use-teams"
import { TeamCreateDialog } from "@/components/features/teams/team-create-dialog"
import { Trash2 } from "lucide-react"

function TeamsContent() {
    const { teams, isLoading, isRefreshing, refresh } = useTeams()
    const { remove } = useTeamMutations()

    async function handleDelete(teamId: string) {
        await remove(String(teamId))
        refresh()
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Teams"
                description="Manage participating teams"
                isRefreshing={isRefreshing}
                onRefresh={refresh}
                actions={<TeamCreateDialog onSuccess={refresh} />}
            />

            <Card>
                <CardHeader>
                    <CardTitle>All Teams</CardTitle>
                    <CardDescription>
                        {teams.length} team{teams.length !== 1 ? "s" : ""} registered
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <LoadingState variant="spinner" />
                    ) : teams.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="No teams yet"
                            description="Create your first team to get started"
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Affiliation</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teams.map((team) => (
                                    <TableRow key={team.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {team.id}
                                        </TableCell>
                                        <TableCell className="font-medium">{team.name}</TableCell>
                                        <TableCell>
                                            {team.country ? (
                                                <Badge variant="outline">{team.country}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {team.affiliation || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <DeleteConfirmDialog
                                                trigger={
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="size-4 text-destructive" />
                                                    </Button>
                                                }
                                                itemName={team.name}
                                                itemType="Team"
                                                onConfirm={() => handleDelete(team.id)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function TeamsPage() {
    return (
        <ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}>
            <TeamsContent />
        </ProtectedRoute>
    )
}
