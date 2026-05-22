'use client';

import { Mail, Users,Headset,Bug } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const cards = [
  {
    icon: Mail,
    title: 'Contact Support',
    description: 'Get help from our support team',
    buttonLabel: 'Contact Us',
    href: '#contact',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Join our developer community',
    buttonLabel: 'Join Discord',
    href: '#discord',
  },
  {
    icon: Bug,
    title: 'Report Issues',
    description: 'Report bugs or feature requests',
    buttonLabel: 'Report Issue',
    href: '#issues',
  },
];

export function SupportHelp() {
  return (
    <Card className="bg-[#111827] border-[#374151]">
      <CardHeader>
        {/* Centered header — icon inline with title */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-2">
            <Headset className="w-6 h-6 text-emerald-500" />
            <CardTitle className="text-2xl text-white">
              Support &amp; Help
            </CardTitle>
          </div>
        
        </div>
      </CardHeader>

      <CardContent>
        {/* Constrained + centered grid — matches the screenshot proportions */}
        <div className="flex justify-center">
          <div className="grid w-full max-w-3xl gap-4 grid-cols-1 sm:grid-cols-3">
            {cards.map(({ icon: Icon, title, description, buttonLabel, href }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center gap-4 rounded-xl border border-[#374151] bg-[#0A0A0A80] p-6"
              >
                {/* Icon */}
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <Icon className="w-6 h-6 text-emerald-500" />
                </div>

                {/* Title + description */}
                <div className="space-y-1 flex-1">
                  <h3 className="font-semibold text-white text-base">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
                </div>

                {/* Button */}
                <Button
                  asChild
                  className="w-full h-10 bg-[#10B981] hover:bg-emerald-600 text-black font-semibold"
                >
                  <a href={href}>{buttonLabel}</a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}