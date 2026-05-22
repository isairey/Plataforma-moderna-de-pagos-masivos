'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Layers } from "lucide-react";
import { motion } from "framer-motion";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm bg-background/50"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Stellar Network Integration
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 max-w-4xl"
          >
            Batch Payments made <br className="hidden md:block" />
            <span className="text-primary">Simple & Secure</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            Send thousands of payments in seconds with the power of the Stellar network.
            Non-custodial, low fees, and instant settlement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col md:flex-row gap-4 w-full md:w-auto pt-4"
          >
            <Link href="/demo">
              <Button size="lg" className="w-full md:w-auto text-lg h-14 px-8 rounded-full group">
                Launch App
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="https://stellar.org" target="_blank">
              <Button variant="outline" size="lg" className="w-full md:w-auto text-lg h-14 px-8 rounded-full">
                Learn about Stellar
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-4xl mx-auto"
          >
            <div className="flex flex-col space-y-2 p-4 rounded-xl border bg-card/50 backdrop-blur-sm">
              <Zap className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-lg">Instant Settlement</h3>
              <p className="text-sm text-muted-foreground">Payments settle in 3-5 seconds on the Stellar network.</p>
            </div>
            <div className="flex flex-col space-y-2 p-4 rounded-xl border bg-card/50 backdrop-blur-sm">
              <Shield className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-lg">Non-Custodial</h3>
              <p className="text-sm text-muted-foreground">We never hold your funds. You control the keys.</p>
            </div>
            <div className="flex flex-col space-y-2 p-4 rounded-xl border bg-card/50 backdrop-blur-sm">
              <Layers className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-lg">Batch Processing</h3>
              <p className="text-sm text-muted-foreground">Group up to 100 payments per transaction to save fees.</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-40"></div>
    </section>
  );
}
