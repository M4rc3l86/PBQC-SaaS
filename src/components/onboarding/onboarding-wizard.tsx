"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Step1Organization } from "./step-1-organization";
import { Step2Site } from "./step-2-site";
import { Step3Template } from "./step-3-template";
import { Step4Invite } from "./step-4-invite";

type Step = 1 | 2 | 3 | 4;

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [organizationId, setOrganizationId] = useState<string>("");
  // Store site and template IDs for potential future use
  const [, setSiteId] = useState<string>("");
  const [, setTemplateId] = useState<string>("");

  const handleStep1Complete = (orgId: string) => {
    setOrganizationId(orgId);
    setCurrentStep(2);
  };

  const handleStep2Complete = (newSiteId: string) => {
    setSiteId(newSiteId);
    setCurrentStep(3);
  };

  const handleStep3Complete = (newTemplateId: string) => {
    setTemplateId(newTemplateId);
    setCurrentStep(4);
  };

  const handleStep4Complete = () => {
    router.push("/");
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1) as Step);
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Schritt {currentStep} von 4
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    step <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <Step1Organization onComplete={handleStep1Complete} />
          )}
          {currentStep === 2 && (
            <Step2Site
              organizationId={organizationId}
              onComplete={handleStep2Complete}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <Step3Template
              organizationId={organizationId}
              onComplete={handleStep3Complete}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <Step4Invite
              organizationId={organizationId}
              onComplete={handleStep4Complete}
              onBack={handleBack}
              onSkip={handleSkip}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
