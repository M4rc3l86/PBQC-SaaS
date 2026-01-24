"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  loginSchema,
  magicLinkSchema,
  type LoginInput,
  type MagicLinkInput,
} from "@/lib/validations/auth";
import { signIn, signInWithMagicLink } from "@/lib/auth/actions";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const passwordForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const magicLinkForm = useForm<MagicLinkInput>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onPasswordSubmit(data: LoginInput) {
    setIsLoading(true);
    setMessage(null);

    const result = await signIn(data);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    }

    setIsLoading(false);
  }

  async function onMagicLinkSubmit(data: MagicLinkInput) {
    setIsLoading(true);
    setMessage(null);

    const result = await signInWithMagicLink(data);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setMessage({ type: "success", text: result.message });
    }

    setIsLoading(false);
  }

  return (
    <Card>
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="password">Passwort</TabsTrigger>
          <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@beispiel.de"
                  {...passwordForm.register("email")}
                  disabled={isLoading}
                />
                {passwordForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Passwort</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:text-primary/80 link-underline transition-colors"
                  >
                    Passwort vergessen?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...passwordForm.register("password")}
                  disabled={isLoading}
                />
                {passwordForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {message && (
                <div
                  className={`p-3 rounded-md text-sm border-l-4 ${
                    message.type === "error"
                      ? "bg-destructive/10 text-destructive border-l-destructive"
                      : "bg-primary/10 text-primary border-l-primary"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Anmelden
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="magic-link">
          <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">E-Mail</Label>
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="name@beispiel.de"
                  {...magicLinkForm.register("email")}
                  disabled={isLoading}
                />
                {magicLinkForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {magicLinkForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Wir senden Ihnen einen Link per E-Mail, mit dem Sie sich ohne
                Passwort anmelden können.
              </p>

              {message && (
                <div
                  className={`p-3 rounded-md text-sm border-l-4 ${
                    message.type === "error"
                      ? "bg-destructive/10 text-destructive border-l-destructive"
                      : "bg-primary/10 text-primary border-l-primary"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Magic Link senden
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
