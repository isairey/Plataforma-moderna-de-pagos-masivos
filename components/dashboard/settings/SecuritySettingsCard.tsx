"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SecuritySettingsCard() {
  const { toast } = useToast();
  const [twoFactor, setTwoFactor] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [manageSessionsOpen, setManageSessionsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    });
    setChangePasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const rows = [
    {
      id: "password",
      title: "Password",
      description: "Last changed 30 days ago",
      action: (
        <Button
          size="sm"
          onClick={() => setChangePasswordOpen(true)}
          className="shrink-0 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white"
        >
          Change
        </Button>
      ),
    },
    {
      id: "2fa",
      title: "Two-Factor Authentication",
      description: "Add extra layer of security",
      action: (
        <Switch
          checked={twoFactor}
          onCheckedChange={(v) => {
            setTwoFactor(v);
            toast({
              title: v ? "2FA enabled" : "2FA disabled",
              description: v
                ? "Two-factor authentication is now active."
                : "Two-factor authentication has been turned off.",
            });
          }}
          className="data-[state=checked]:bg-emerald-500 shrink-0"
        />
      ),
    },
    {
      id: "alerts",
      title: "Security Alerts",
      description: "Get notified of suspicious activity",
      action: (
        <Switch
          checked={securityAlerts}
          onCheckedChange={(v) => {
            setSecurityAlerts(v);
            toast({
              title: v ? "Security alerts enabled" : "Security alerts disabled",
              description: v
                ? "You'll be notified of suspicious activity."
                : "Security alert notifications are off.",
            });
          }}
          className="data-[state=checked]:bg-emerald-500 shrink-0"
        />
      ),
    },
    {
      id: "sessions",
      title: "Active Sessions",
      description: "2 active sessions",
      action: (
        <Button
          size="sm"
          onClick={() => setManageSessionsOpen(true)}
          className="shrink-0 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white"
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl text-white">
                Security Settings
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage your account security
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-0">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className={`flex items-center justify-between gap-4 py-4 ${
                index !== 0 ? "border-t border-slate-800" : ""
              }`}
            >
              <div className="space-y-0.5 min-w-0">
                <div className="text-white font-medium">{row.title}</div>
                <div className="text-sm text-slate-400">{row.description}</div>
              </div>
              {row.action}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Change Password</DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-300">Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-11 bg-slate-950 border-slate-800/50 text-white focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 bg-slate-950 border-slate-800/50 text-white focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 bg-slate-950 border-slate-800/50 text-white focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50"
              />
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setChangePasswordOpen(false)}
              className="flex-1 bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Sessions Dialog */}
      <Dialog open={manageSessionsOpen} onOpenChange={setManageSessionsOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Active Sessions</DialogTitle>
            <DialogDescription className="text-slate-400">
              Manage your active login sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { device: "Chrome on macOS", location: "Lagos, NG", current: true, time: "Now" },
              { device: "Safari on iPhone", location: "Lagos, NG", current: false, time: "2 hours ago" },
            ].map((session, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800/50"
              >
                <div className="space-y-0.5">
                  <div className="text-sm text-white font-medium flex items-center gap-2">
                    {session.device}
                    {session.current && (
                      <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {session.location} · {session.time}
                  </div>
                </div>
                {!session.current && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 text-xs h-7"
                    onClick={() => {
                      toast({ title: "Session revoked", description: `${session.device} has been signed out.` });
                      setManageSessionsOpen(false);
                    }}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setManageSessionsOpen(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}