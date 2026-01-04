"use client";

// ============================================
// FIREBASE ADMIN SETUP SCRIPT
// ============================================
// Run this once to set up admin users in Firestore
// Access this page at: /admin/setup

import { useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, Shield } from "lucide-react";

// Admin emails to set up
const ADMIN_EMAILS = [
  "lab91820@gmail.com",
  "mesyedrn@gmail.com",
  "mesyednr@gmail.com",
];

type SetupStatus = "idle" | "running" | "success" | "error";

export default function AdminSetupPage() {
  const [status, setStatus] = useState<SetupStatus>("idle");
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<{ email: string; status: string }[]>([]);

  const setupAdmins = async () => {
    setStatus("running");
    setMessage("Setting up admin users...");
    const newResults: { email: string; status: string }[] = [];

    try {
      for (const email of ADMIN_EMAILS) {
        // Create a document ID from email (replace special chars)
        const docId = email.replace(/[.@]/g, "_");
        const docRef = doc(db, COLLECTIONS.USERS, docId);
        
        // Check if already exists
        const existing = await getDoc(docRef);
        if (existing.exists()) {
          newResults.push({ email, status: "Already exists (skipped)" });
          continue;
        }

        // Create admin user document
        await setDoc(docRef, {
          email,
          role: "admin",
          displayName: email.split("@")[0],
          createdAt: new Date().toISOString(),
        });
        
        newResults.push({ email, status: "Created as admin ✓" });
      }

      // Create default tournament settings
      const settingsRef = doc(db, COLLECTIONS.SETTINGS, "tournament");
      const existingSettings = await getDoc(settingsRef);
      if (!existingSettings.exists()) {
        await setDoc(settingsRef, {
          tournamentName: "Arena Ace Tournament",
          killPoints: 1,
          placementPoints: {
            1: 15, 2: 12, 3: 10, 4: 8, 5: 6,
            6: 5, 7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0
          },
          maxTeamsPerMatch: 12,
          createdAt: new Date().toISOString(),
        });
        newResults.push({ email: "Tournament Settings", status: "Created ✓" });
      } else {
        newResults.push({ email: "Tournament Settings", status: "Already exists (skipped)" });
      }

      setResults(newResults);
      setStatus("success");
      setMessage("Setup complete! All admin users have been configured.");
    } catch (error: any) {
      setStatus("error");
      setMessage(`Error: ${error.message}`);
      setResults(newResults);
    }
  };

  return (
    <div className="container py-12 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-4xl tracking-wider">Admin Setup</CardTitle>
          <CardDescription className="text-lg">
            One-time setup to configure admin users in Firebase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Admin emails to be configured:</h3>
            <ul className="space-y-1">
              {ADMIN_EMAILS.map((email) => (
                <li key={email} className="text-muted-foreground">• {email}</li>
              ))}
            </ul>
          </div>

          {status === "idle" && (
            <Button onClick={setupAdmins} className="w-full text-lg py-6">
              Run Setup
            </Button>
          )}

          {status === "running" && (
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">{message}</span>
            </div>
          )}

          {(status === "success" || status === "error") && (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                status === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              }`}>
                {status === "success" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
                <span className="text-lg">{message}</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Results:</h4>
                {results.map((result, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                    <span>{result.email}</span>
                    <span className="text-muted-foreground text-sm">{result.status}</span>
                  </div>
                ))}
              </div>

              {status === "success" && (
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">✓ Setup Complete!</h4>
                  <p className="text-sm text-muted-foreground">
                    You can now log in with any of the admin emails. Make sure you&apos;ve created 
                    these users in Firebase Authentication first.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
