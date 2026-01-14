"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { isStaffRole } from "@/lib/utils"
import { TeamDashboard } from "@/components/features/dashboard/team-dashboard"
import { AdminDashboard } from "@/components/features/dashboard/admin-dashboard"
import { LoadingState } from "@/components/common"

function DashboardContent() {
  const { user } = useAuth()

  if (!user) {
    return <LoadingState variant="spinner" />
  }

  return isStaffRole(user.role) ? <AdminDashboard /> : <TeamDashboard user={user} />
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
