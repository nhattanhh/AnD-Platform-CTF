import Link from "next/link"
import { Shield, Swords, Target, Users, Terminal, ArrowLeft, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Shield className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold">AnD Platform</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Sign In</Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">About AnD Platform</h1>
                        <p className="text-sm text-muted-foreground">Attack-Defense CTF Gameserver</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <p className="text-muted-foreground">
                        <strong className="text-foreground">AnD Platform</strong> is a professional-grade
                        Attack-Defense Capture The Flag (CTF) gameserver designed for cybersecurity training,
                        competitions, and educational purposes.
                    </p>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Swords className="h-5 w-5" />
                                What is Attack-Defense CTF?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-muted-foreground">
                            <p>Attack-Defense is a CTF format where teams run identical vulnerable services. Teams must:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li><strong className="text-foreground">Attack:</strong> Exploit vulnerabilities in other teams&apos; services</li>
                                <li><strong className="text-foreground">Defend:</strong> Patch vulnerabilities to prevent flag theft</li>
                                <li><strong className="text-foreground">Maintain SLA:</strong> Keep services running for checker scripts</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                How Scoring Works
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-muted-foreground">
                            <p>The game runs in <strong className="text-foreground">ticks</strong> (typically 60 seconds). Each tick:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>New flags are placed in each team&apos;s vulnbox</li>
                                <li>Checker scripts verify service availability</li>
                                <li>Teams capture flags from other teams</li>
                                <li>Scores are calculated and leaderboard updates</li>
                            </ol>
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                <div className="p-3 rounded-lg border text-center">
                                    <Swords className="h-5 w-5 mx-auto mb-1" />
                                    <div className="font-medium text-sm">Attack</div>
                                    <div className="text-xs text-muted-foreground">Flags captured</div>
                                </div>
                                <div className="p-3 rounded-lg border text-center">
                                    <Shield className="h-5 w-5 mx-auto mb-1" />
                                    <div className="font-medium text-sm">Defense</div>
                                    <div className="text-xs text-muted-foreground">Flags protected</div>
                                </div>
                                <div className="p-3 rounded-lg border text-center">
                                    <Target className="h-5 w-5 mx-auto mb-1" />
                                    <div className="font-medium text-sm">SLA</div>
                                    <div className="text-xs text-muted-foreground">Service uptime</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code className="h-5 w-5" />
                                Platform Features
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {[
                                    { icon: Terminal, title: "SSH Access", desc: "Direct access to your vulnbox" },
                                    { icon: Shield, title: "Real-time Scoring", desc: "Live leaderboard updates" },
                                    { icon: Users, title: "Team Management", desc: "Manage competition teams" },
                                    { icon: Target, title: "SLA Monitoring", desc: "Automated health checks" },
                                ].map((f) => (
                                    <div key={f.title} className="flex items-start gap-3 p-3 rounded-lg border">
                                        <f.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <div className="font-medium text-sm">{f.title}</div>
                                            <div className="text-xs text-muted-foreground">{f.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Ready to Start?</CardTitle>
                            <CardDescription>Create an account to join competitions</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center gap-3">
                            <Link href="/signup">
                                <Button>Create Account</Button>
                            </Link>
                            <Link href="/live">
                                <Button variant="outline">View Scoreboard</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <footer className="border-t py-6 mt-8">
                <div className="mx-auto max-w-3xl px-4 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} AnD Platform
                </div>
            </footer>
        </div>
    )
}
