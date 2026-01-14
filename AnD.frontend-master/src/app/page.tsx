"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
    Shield, Swords, Trophy, Timer, Users, Terminal,
    ChevronRight, Lock, BarChart3, ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function LandingPage() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/dashboard")
        }
    }, [isAuthenticated, isLoading, router])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Shield className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold">AnD Platform</span>
                        </div>

                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/live" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Live Scoreboard
                            </Link>
                            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                About
                            </Link>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Sign In</Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm">
                                    Get Started
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Shield className="h-8 w-8" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Attack-Defense CTF Platform
                    </h1>

                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        A professional gameserver for Attack-Defense Capture The Flag competitions.
                        Deploy vulnerable services, capture enemy flags, defend your territory.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup">
                            <Button size="lg">
                                Join Competition
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/live">
                            <Button size="lg" variant="outline">
                                <Trophy className="mr-2 h-5 w-5" />
                                View Scoreboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-4 border-y bg-muted/30">
                <div className="mx-auto max-w-4xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Real-time Ticks", value: "60s", icon: Timer },
                            { label: "Flag Types", value: "2", icon: Lock },
                            { label: "Live Scoring", value: "SLA", icon: BarChart3 },
                            { label: "Team Based", value: "∞", icon: Users },
                        ].map((stat) => (
                            <Card key={stat.label}>
                                <CardContent className="pt-6 text-center">
                                    <stat.icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            Everything You Need for Attack-Defense CTF
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Our platform provides all the tools for running professional cybersecurity competitions.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Swords,
                                title: "Attack & Capture",
                                description: "Exploit vulnerabilities in enemy services. Capture their flags and steal their points.",
                            },
                            {
                                icon: Shield,
                                title: "Defend & Patch",
                                description: "Protect your vulnbox from attackers. Patch vulnerabilities while keeping services running.",
                            },
                            {
                                icon: Trophy,
                                title: "Compete & Win",
                                description: "Real-time scoring with SLA monitoring. Climb the leaderboard and prove your skills.",
                            },
                            {
                                icon: Terminal,
                                title: "SSH Access",
                                description: "Direct SSH access to your vulnbox. Full control over your defensive environment.",
                            },
                            {
                                icon: Timer,
                                title: "Tick-Based Rounds",
                                description: "New flags every tick cycle. Continuous gameplay with fair scoring intervals.",
                            },
                            {
                                icon: Users,
                                title: "Team Collaboration",
                                description: "Work together with your team. Coordinate attacks and defense strategies.",
                            },
                        ].map((feature) => (
                            <Card key={feature.title}>
                                <CardHeader>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
                                        <feature.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 border-t">
                <div className="mx-auto max-w-2xl">
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Ready to Compete?</CardTitle>
                            <CardDescription>
                                Join thousands of cybersecurity enthusiasts in the ultimate attack-defense challenge.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/signup">
                                <Button size="lg">
                                    Create Account
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button size="lg" variant="outline">
                                    Sign In
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-8 px-4">
                <div className="mx-auto max-w-5xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Shield className="h-4 w-4" />
                            </div>
                            <span className="font-semibold">AnD Platform</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <Link href="/live" className="hover:text-foreground transition-colors">Scoreboard</Link>
                            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
                            <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} AnD Platform
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
