"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File, format: 'json' | 'csv') => void;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase().split('.').pop();
    if (!['json', 'csv'].includes(ext || '')) {
      toast({
        title: "Invalid file type",
        description: "Please select a JSON or CSV file",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    onFileSelect(file, ext as 'json' | 'csv');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase().split('.').pop();
    if (!['json', 'csv'].includes(ext || '')) {
      toast({
        title: "Invalid file type",
        description: "Please select a JSON or CSV file",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    onFileSelect(file, ext as 'json' | 'csv');
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <a
          href="/examples/payments.csv"
          download="payments-sample.csv"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4 rounded-lg text-center font-medium transition-colors"
        >
          Download CSV Sample
        </a>
        <a
          href="/examples/payments.json"
          download="payments-sample.json"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg text-center font-medium transition-colors"
        >
          Download JSON Sample
        </a>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-slate-950/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-slate-300 mb-2">
          {fileName ? (
            <>
              <span className="font-semibold text-white">{fileName}</span>
              <br />
              <span className="text-sm text-slate-400">Click to change</span>
            </>
          ) : (
            <>
              <span>Drag and drop your file here</span>
              <br />
              <span className="text-sm text-slate-400">or click to browse</span>
            </>
          )}
        </p>
        <p className="text-xs text-slate-500 mt-2">Supported: JSON or CSV</p>
      </div>
      <div className="mt-4">
        <details className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-sm">
          <summary className="cursor-pointer font-semibold text-slate-300">
            File Format Requirements
          </summary>
          <div className="mt-3 space-y-2 text-slate-400">
            <div>
              <p className="font-mono text-xs bg-slate-950 p-2 rounded my-1 overflow-x-auto">
                JSON example: address, amount, asset
              </p>
            </div>
            <div>
              <p className="font-mono text-xs bg-slate-950 p-2 rounded my-1">
                CSV: address,amount,asset
              </p>
            </div>
            <ul className="list-disc list-inside text-xs ml-2">
              <li>address: Stellar public key (starts with G)</li>
              <li>amount: Positive number</li>
              <li>asset: 'XLM' or 'CODE:ISSUER'</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}
