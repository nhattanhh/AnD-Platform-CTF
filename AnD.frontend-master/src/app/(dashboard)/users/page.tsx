"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, UserPlus, Search, RefreshCw, AlertCircle, Check, MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import type { UserListItem, Team } from "@/lib/types/auth";

export default function UsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState<string>("all");
    const [filterTeam, setFilterTeam] = useState<string>("all");

    // Dialog state
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
    const [selectedTeamId, setSelectedTeamId] = useState<string>("");
    const [editForm, setEditForm] = useState({ displayName: "", affiliation: "", role: "" });
    const [createForm, setCreateForm] = useState({ username: "", password: "", displayName: "", role: "STUDENT", affiliation: "", teamId: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await api.users.list();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load users");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTeams = useCallback(async () => {
        try {
            const data = await api.teams.list();
            setTeams(data);
        } catch (err) {
            console.error("Failed to load teams:", err);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchTeams();
    }, [fetchUsers, fetchTeams]);

    // Filter users
    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.displayName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = filterRole === "all" || u.role === filterRole;

        const matchesTeam =
            filterTeam === "all" ||
            (filterTeam === "unassigned" && !u.teamId) ||
            (filterTeam !== "unassigned" && String(u.teamId) === filterTeam);

        return matchesSearch && matchesRole && matchesTeam;
    });

    // Open assign dialog
    const handleOpenAssignDialog = (userItem: UserListItem) => {
        setSelectedUser(userItem);
        // Use 'none' for consistency with the Select option value
        setSelectedTeamId(userItem.teamId ? String(userItem.teamId) : "none");
        setIsAssignDialogOpen(true);
    };

    // Open edit dialog
    const handleOpenEditDialog = (userItem: UserListItem) => {
        setSelectedUser(userItem);
        setEditForm({
            displayName: userItem.displayName,
            affiliation: userItem.affiliation || "",
            role: userItem.role,
        });
        setIsEditDialogOpen(true);
    };

    // Open delete dialog
    const handleOpenDeleteDialog = (userItem: UserListItem) => {
        setSelectedUser(userItem);
        setIsDeleteDialogOpen(true);
    };

    // Open create dialog
    const handleOpenCreateDialog = () => {
        setCreateForm({ username: "", password: "", displayName: "", role: "STUDENT", affiliation: "", teamId: "none" });
        setIsCreateDialogOpen(true);
    };

    // Assign user to team
    const handleAssignTeam = async () => {
        if (!selectedUser) return;
        setIsSubmitting(true);
        setError("");

        try {
            // Check if a valid team is selected (not empty, not 'none')
            const hasValidTeam = selectedTeamId && selectedTeamId !== "none" && selectedTeamId !== "";

            if (hasValidTeam) {
                await api.users.assignTeam(selectedUser.id, selectedTeamId);
                setSuccessMessage(`${selectedUser.displayName} assigned to team successfully`);
            } else {
                await api.users.removeTeam(selectedUser.id);
                setSuccessMessage(`${selectedUser.displayName} removed from team`);
            }
            setIsAssignDialogOpen(false);
            fetchUsers();
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update team assignment");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update user
    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        setIsSubmitting(true);
        setError("");

        try {
            await api.users.update(selectedUser.id, {
                displayName: editForm.displayName,
                affiliation: editForm.affiliation || undefined,
                role: editForm.role,
            });
            setSuccessMessage(`${selectedUser.username} updated successfully`);
            setIsEditDialogOpen(false);
            fetchUsers();
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update user");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete user
    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setIsSubmitting(true);
        setError("");

        try {
            await api.users.delete(selectedUser.id);
            setSuccessMessage(`${selectedUser.username} deleted`);
            setIsDeleteDialogOpen(false);
            fetchUsers();
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete user");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Create user
    const handleCreateUser = async () => {
        setIsSubmitting(true);
        setError("");

        try {
            await api.users.create({
                username: createForm.username,
                password: createForm.password,
                displayName: createForm.displayName || undefined,
                role: createForm.role,
                affiliation: createForm.affiliation || undefined,
                teamId: createForm.teamId && createForm.teamId !== "none" ? createForm.teamId : undefined,
            });
            setSuccessMessage(`User ${createForm.username} created successfully`);
            setIsCreateDialogOpen(false);
            fetchUsers();
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create user");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Role badge color
    const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (role) {
            case "ADMIN":
                return "destructive";
            case "TEACHER":
                return "secondary";
            default:
                return "outline";
        }
    };

    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
        return (
            <div className="container py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You don't have permission to access this page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const isAdmin = user.role === "ADMIN";

    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-8 w-8" />
                        User Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage users and assign them to teams
                    </p>
                </div>
                <div className="flex gap-2">
                    {isAdmin && (
                        <Button onClick={handleOpenCreateDialog}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    )}
                    <Button onClick={fetchUsers} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {successMessage && (
                <Alert className="bg-green-500/10 border-green-500/20 text-green-600">
                    <Check className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                        {users.length} total users, {users.filter((u) => !u.teamId).length} unassigned
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={filterRole} onValueChange={setFilterRole}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="TEACHER">Teacher</SelectItem>
                                <SelectItem value="STUDENT">Student</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterTeam} onValueChange={setFilterTeam}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Team" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Teams</SelectItem>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {teams.map((team) => (
                                    <SelectItem key={team.id} value={String(team.id)}>
                                        {team.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No users found</div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Team</TableHead>
                                        <TableHead>Affiliation</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((userItem) => (
                                        <TableRow key={userItem.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{userItem.displayName}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        @{userItem.username}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getRoleBadgeVariant(userItem.role)}>
                                                    {userItem.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {userItem.teamName ? (
                                                    <Badge variant="outline" className="bg-primary/5">
                                                        {userItem.teamName}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {userItem.affiliation || "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenAssignDialog(userItem)}
                                                    >
                                                        <UserPlus className="h-4 w-4 mr-1" />
                                                        {userItem.teamId ? "Change" : "Assign"}
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleOpenEditDialog(userItem)}>
                                                                <Pencil className="h-4 w-4 mr-2" />
                                                                Edit User
                                                            </DropdownMenuItem>
                                                            {isAdmin && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleOpenDeleteDialog(userItem)}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete User
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Assign Team Dialog */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign User to Team</DialogTitle>
                        <DialogDescription>
                            {selectedUser && (
                                <>
                                    Select a team for <strong>{selectedUser.displayName}</strong> (@{selectedUser.username})
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a team" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Team (Unassign)</SelectItem>
                                {teams.map((team) => (
                                    <SelectItem key={team.id} value={String(team.id)}>
                                        {team.name}
                                        {team.affiliation && ` - ${team.affiliation}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAssignDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAssignTeam} disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            {selectedUser && (
                                <>
                                    Update details for <strong>@{selectedUser.username}</strong>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                value={editForm.displayName}
                                onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
                                placeholder="Display name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="affiliation">Affiliation</Label>
                            <Input
                                id="affiliation"
                                value={editForm.affiliation}
                                onChange={(e) => setEditForm((f) => ({ ...f, affiliation: e.target.value }))}
                                placeholder="University or organization"
                            />
                        </div>
                        {isAdmin && (
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={editForm.role} onValueChange={(v) => setEditForm((f) => ({ ...f, role: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="TEACHER">Teacher</SelectItem>
                                        <SelectItem value="STUDENT">Student</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateUser} disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                            Add a new user to the system
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newUsername">Username <span className="text-destructive">*</span></Label>
                            <Input
                                id="newUsername"
                                value={createForm.username}
                                onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))}
                                placeholder="Username"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Password <span className="text-destructive">*</span></Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={createForm.password}
                                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                                placeholder="Password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newDisplayName">Display Name</Label>
                            <Input
                                id="newDisplayName"
                                value={createForm.displayName}
                                onChange={(e) => setCreateForm((f) => ({ ...f, displayName: e.target.value }))}
                                placeholder="Display name (optional)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newRole">Role</Label>
                            <Select value={createForm.role} onValueChange={(v) => setCreateForm((f) => ({ ...f, role: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="TEACHER">Teacher</SelectItem>
                                    <SelectItem value="STUDENT">Student</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newAffiliation">Affiliation</Label>
                            <Input
                                id="newAffiliation"
                                value={createForm.affiliation}
                                onChange={(e) => setCreateForm((f) => ({ ...f, affiliation: e.target.value }))}
                                placeholder="University or organization"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newTeam">Team</Label>
                            <Select value={createForm.teamId} onValueChange={(v) => setCreateForm((f) => ({ ...f, teamId: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select team (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Team</SelectItem>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={String(team.id)}>
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateUser}
                            disabled={isSubmitting || !createForm.username || !createForm.password}
                        >
                            {isSubmitting ? "Creating..." : "Create User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedUser && (
                                <>
                                    Are you sure you want to delete <strong>{selectedUser.displayName}</strong> (@{selectedUser.username})?
                                    This action cannot be undone.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            disabled={isSubmitting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isSubmitting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
