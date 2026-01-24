"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  updatePasswordSchema,
  type UpdatePasswordInput,
} from "@/lib/validations/auth";
import { updatePassword } from "@/lib/auth/actions";

export function UpdatePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({
    control: form.control,
    name: "password",
    defaultValue: "",
  });

  const passwordRequirements = [
    { met: password.length >= 8, text: "Mindestens 8 Zeichen" },
    { met: /[A-Z]/.test(password), text: "Ein Großbuchstabe" },
    { met: /[a-z]/.test(password), text: "Ein Kleinbuchstabe" },
    { met: /\d/.test(password), text: "Eine Zahl" },
  ];

  async function onSubmit(data: UpdatePasswordInput) {
    setIsLoading(true);
    setMessage(null);

    const result = await updatePassword(data);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    }

    setIsLoading(false);
  }

  return (
    <Card>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="password">Neues Passwort</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              disabled={isLoading}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}

            {password.length > 0 && (
              <div className="mt-3 p-3 rounded-md bg-muted/50 space-y-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className={`h-2 w-2 rounded-full transition-colors ${
                        req.met ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    />
                    <span
                      className={`transition-colors ${
                        req.met ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...form.register("confirmPassword")}
              disabled={isLoading}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmPassword.message}
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
            Passwort aktualisieren
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
