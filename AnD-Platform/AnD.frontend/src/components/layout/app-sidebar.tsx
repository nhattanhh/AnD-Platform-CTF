"use client"

import {
  Gamepad2,
  Shield,
  Bug,
  Trophy,
  Flag,
  Clock,
  Send,
  LayoutDashboard,
  Users,
  UserCog,
  LogOut,
  User,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getUserInitials, getRoleColor } from "@/lib/utils"
import type { UserRole } from "@/lib/types/auth"

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  allowedRoles?: UserRole[]
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navigationItems: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Users", url: "/users", icon: UserCog, allowedRoles: ["ADMIN", "TEACHER"] },
      { title: "Teams", url: "/teams", icon: Users, allowedRoles: ["ADMIN", "TEACHER"] },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "Vulnboxes", url: "/vulnboxes", icon: Shield, allowedRoles: ["ADMIN", "TEACHER"] },
      { title: "Checkers", url: "/checkers", icon: Bug, allowedRoles: ["ADMIN", "TEACHER"] },
    ],
  },
  {
    title: "Competition",
    items: [
      { title: "Games", url: "/games", icon: Gamepad2 },
      { title: "Scoreboard", url: "/scoreboard", icon: Trophy },
    ],
  },
  {
    title: "Monitoring",
    items: [
      { title: "Flags", url: "/flags", icon: Flag, allowedRoles: ["ADMIN", "TEACHER"] },
      { title: "Ticks", url: "/ticks", icon: Clock, allowedRoles: ["ADMIN", "TEACHER"] },
      { title: "Submissions", url: "/submissions", icon: Send, allowedRoles: ["ADMIN", "TEACHER"] },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (!item.allowedRoles) return true
      if (!user) return false
      return item.allowedRoles.includes(user.role)
    }),
  })).filter((group) => group.items.length > 0)

  const initials = user ? getUserInitials(user.displayName) : "?"
  const roleColor = user ? getRoleColor(user.role) : "text-gray-500"

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Gamepad2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ADG Platform</span>
                  <span className="truncate text-xs text-muted-foreground">Attack-Defense CTF</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {filteredNavigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url ||
                    (item.url !== "/dashboard" && pathname.startsWith(item.url))
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="hover:bg-accent">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.displayName}</span>
                      <span className={`truncate text-xs ${roleColor}`}>
                        {user.role}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  )
}
