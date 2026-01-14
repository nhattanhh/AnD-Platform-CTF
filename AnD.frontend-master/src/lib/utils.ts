import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { GameStatus, SubmissionStatus, TickStatus, CheckStatus } from "@/lib/types"
import type { UserRole } from "@/lib/types/auth"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// Status Color Utilities
// ============================================

export function getGameStatusColor(status: GameStatus): string {
  const colors: Record<GameStatus, string> = {
    running: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    paused: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    finished: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    deploying: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  }
  return colors[status] ?? colors.draft
}

export function getGameStatusVariant(status: GameStatus): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<GameStatus, "default" | "secondary" | "destructive" | "outline"> = {
    running: "default",
    paused: "secondary",
    finished: "outline",
    deploying: "secondary",
    draft: "outline",
  }
  return variants[status] ?? "outline"
}

export function getSubmissionStatusColor(status: SubmissionStatus): string {
  const colors: Record<SubmissionStatus, string> = {
    accepted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    invalid: "bg-red-500/10 text-red-500 border-red-500/20",
    duplicate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    own_flag: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    expired: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  }
  return colors[status] ?? ""
}

export function getTickStatusColor(status: TickStatus): string {
  const colors: Record<TickStatus, string> = {
    active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    completed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
  }
  return colors[status] ?? ""
}

export function getCheckStatusColor(status: CheckStatus): string {
  const colors: Record<CheckStatus, string> = {
    up: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    down: "bg-red-500/10 text-red-500 border-red-500/20",
    error: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  }
  return colors[status] ?? ""
}

export function getRankColor(rank: number): string {
  if (rank === 1) return "bg-amber-500/10 text-amber-500 border-amber-500/20"
  if (rank === 2) return "bg-slate-400/10 text-slate-400 border-slate-400/20"
  if (rank === 3) return "bg-orange-500/10 text-orange-500 border-orange-500/20"
  return ""
}

// ============================================
// Date & Time Formatters
// ============================================

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${mins}m`
}

// ============================================
// Role & Permission Utilities
// ============================================

export function isStaffRole(role: UserRole): boolean {
  return role === "ADMIN" || role === "TEACHER"
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    ADMIN: "text-red-500",
    TEACHER: "text-blue-500",
    STUDENT: "text-green-500",
  }
  return colors[role] ?? "text-gray-500"
}

export function canManageGames(role: UserRole): boolean {
  return role === "ADMIN"
}

export function canManageTeams(role: UserRole): boolean {
  return role === "ADMIN" || role === "TEACHER"
}

export function canViewFlags(role: UserRole): boolean {
  return role === "ADMIN" || role === "TEACHER"
}

// ============================================
// Validation Utilities
// ============================================

export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// ============================================
// String Utilities
// ============================================

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + "..."
}

export function getUserInitials(displayName: string): string {
  return displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
