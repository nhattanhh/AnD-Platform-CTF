"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { getUserInitials, getRoleColor } from "@/lib/utils";
import { User, Users, Shield, Building, Mail, Calendar } from "lucide-react";

export default function ProfilePage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="container py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading profile...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container py-8">
                <Alert variant="destructive">
                    <AlertDescription>
                        You must be logged in to view this page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const initials = getUserInitials(user.displayName);
    const roleColor = getRoleColor(user.role);

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

    return (
        <div className="container py-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <User className="h-8 w-8" />
                    My Profile
                </h1>
                <p className="text-muted-foreground">
                    View and manage your profile information
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <Avatar className="h-24 w-24">
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-xl font-semibold">{user.displayName}</h2>
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                            <Badge variant={getRoleBadgeVariant(user.role)} className="text-sm">
                                {user.role}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                            Your account details and team assignment
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                                    <p className="text-sm">{user.displayName}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                                    <p className="text-sm">@{user.username}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                                    <p className={`text-sm font-medium ${roleColor}`}>{user.role}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Team Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Team Assignment
                            </h3>

                            {user.teamName ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{user.teamName}</p>
                                        <p className="text-xs text-muted-foreground">Team ID: {user.teamId}</p>
                                    </div>
                                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                        Active
                                    </Badge>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">No team assigned</p>
                                        <p className="text-xs">Contact an administrator to join a team</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {user.isStudent && (
                            <>
                                <Separator />
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <Building className="h-5 w-5 text-blue-500" />
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                        You are registered as a student participant in Attack-Defense CTF competitions.
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
