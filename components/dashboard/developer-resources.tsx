"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Code, ExternalLink, Terminal } from "lucide-react";

const cliCommands = [
  { command: "npm install -g @stellar-batch-pay/cli", description: "Install CLI globally" },
  { command: "batchpay submit --file payments.csv --network testnet", description: "Submit a batch payment" },
  { command: "batchpay status --batch-id BATCH-123", description: "Check batch status" },
];

export function DeveloperResources() {
  return (
    <div id="documentation" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Developer Resources
        </h2>
        <p className="text-gray-400">
          Everything you need to integrate with Stellar Batch Pay
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CLI Usage Card */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/20">
                <Terminal className="w-5 h-5 text-teal-500" />
              </div>
              <CardTitle className="text-lg font-semibold text-white">
                CLI Usage
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {cliCommands.map((item, index) => (
              <div key={index} className="space-y-2">
                <p className="text-sm text-gray-400">{item.description}</p>
                <div className="relative group">
                  <pre className="bg-gray-950 border border-gray-800 rounded-lg p-3 overflow-x-auto">
                    <code className="text-sm font-mono text-teal-400">
                      {item.command}
                    </code>
                  </pre>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* API Integration Card */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Code className="w-5 h-5 text-blue-500" />
              </div>
              <CardTitle className="text-lg font-semibold text-white">
                API Integration
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* REST API Card */}
            <a
              href="https://docs.stellarbatchpay.com/api"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-lg hover:border-teal-500/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-500/10">
                    <Code className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white group-hover:text-teal-400 transition-colors">
                      REST API
                    </p>
                    <p className="text-sm text-gray-500">Full API reference</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                    v1.0
                  </Badge>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-teal-400 transition-colors" />
                </div>
              </div>
            </a>

            {/* GitHub Repository Card */}
            <a
              href="https://github.com/jahrulezfrancis/Stellar-Batch-Pay"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-lg hover:border-teal-500/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-gray-800">
                    <Github className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white group-hover:text-teal-400 transition-colors">
                      GitHub Repository
                    </p>
                    <p className="text-sm text-gray-500">Source code & examples</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-teal-400 transition-colors" />
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
