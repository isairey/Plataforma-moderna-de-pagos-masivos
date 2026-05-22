"use client";

import { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AccountProfileCard() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>("/img.svg");
  const [fullName, setFullName] = useState("Alex Johnson");
  const [email, setEmail] = useState("alex@company.com");
  const [organization, setOrganization] = useState("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or GIF image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 2MB.",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    toast({
      title: "Avatar updated",
      description: "Your avatar has been changed successfully.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Changes saved",
      description: "Your profile has been updated successfully.",
    });
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg">
            <User className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl text-white">
              Account Profile
            </CardTitle>
            <CardDescription className="text-slate-400">
              Update your personal information
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Avatar Section */}
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16 ring-2 ring-emerald-500/40 ring-offset-2 ring-offset-slate-900">
            <AvatarImage src={avatarPreview ?? ""} alt={fullName} />
            <AvatarFallback className="bg-slate-800 text-white text-lg">
              {fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Avatar
            </Button>
            <p className="text-xs text-slate-500">
              JPG, PNG or GIF. Max size 2MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800" />

        {/* Form Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-fullname" className="text-slate-300">
              Full Name
            </Label>
            <Input
              id="settings-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12 bg-slate-950 border-slate-800/50 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email" className="text-slate-300">
              Email Address
            </Label>
            <Input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-slate-950 border-slate-800/50 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="settings-org" className="text-slate-300">
              Organization Name
            </Label>
            <Input
              id="settings-org"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Optional"
              className="h-12 bg-slate-950 border-slate-800/50 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6"
          >
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
