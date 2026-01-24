"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { signUp } from "@/lib/auth/actions";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = useWatch({
    control: form.control,
    name: "password",
    defaultValue: "",
  });
  const acceptTerms = useWatch({
    control: form.control,
    name: "acceptTerms",
    defaultValue: false,
  });

  const passwordRequirements = [
    { met: password.length >= 8, text: "Mindestens 8 Zeichen" },
    { met: /[A-Z]/.test(password), text: "Ein Großbuchstabe" },
    { met: /[a-z]/.test(password), text: "Ein Kleinbuchstabe" },
    { met: /\d/.test(password), text: "Eine Zahl" },
  ];

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    setMessage(null);

    const result = await signUp(data);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setMessage({ type: "success", text: result.message });
    }

    setIsLoading(false);
  }

  return (
    <Card>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@beispiel.de"
              {...form.register("email")}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              disabled={isLoading}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}

            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {req.met ?
                      <Check className="h-4 w-4 text-green-500" />
                    : <X className="h-4 w-4 text-gray-300" />}
                    <span
                      className={req.met ? "text-green-600" : "text-gray-500"}
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
              <p className="text-sm text-red-500">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms}
              onCheckedChange={(checked) =>
                form.setValue("acceptTerms", checked as boolean)
              }
              disabled={isLoading}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="acceptTerms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ich akzeptiere die{" "}
                <a href="/terms" className="text-primary hover:underline">
                  Nutzungsbedingungen
                </a>{" "}
                und{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  Datenschutzerklärung
                </a>
              </label>
              {form.formState.errors.acceptTerms && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.acceptTerms.message}
                </p>
              )}
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "error" ?
                  "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              }`}
            >
              {message.text}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Konto erstellen
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
