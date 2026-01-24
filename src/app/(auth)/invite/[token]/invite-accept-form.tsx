"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { acceptInvitation } from "@/lib/auth/invite";

interface InviteAcceptFormProps {
  token: string;
  organizationName: string;
}

export function InviteAcceptForm({ token, organizationName }: InviteAcceptFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleAccept() {
    setIsLoading(true);
    setError(null);

    const result = await acceptInvitation(token);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    // Redirect to dashboard
    router.push("/dashboard");
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Klicken Sie auf die Schaltfläche unten, um der Organisation{" "}
          <strong>{organizationName}</strong> beizutreten.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-md text-sm bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={handleAccept} className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Einladung annehmen
        </Button>
      </CardFooter>
    </Card>
  );
}
