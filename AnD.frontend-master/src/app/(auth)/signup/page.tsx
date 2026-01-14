"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, AlertCircle, Info } from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    displayName: "",
    affiliation: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signup({
        username: formData.username,
        password: formData.password,
        displayName: formData.displayName || undefined,
        affiliation: formData.affiliation || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UserPlus className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Register to participate in competitions
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                After registration, an admin will assign you to a team.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange("username")}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Choose a password"
                value={formData.password}
                onChange={handleChange("password")}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">
                Display Name
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your display name (optional)"
                value={formData.displayName}
                onChange={handleChange("displayName")}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="affiliation">
                Affiliation
              </Label>
              <Input
                id="affiliation"
                type="text"
                placeholder="University or organization"
                value={formData.affiliation}
                onChange={handleChange("affiliation")}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
