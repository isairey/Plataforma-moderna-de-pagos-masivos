'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CtaSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-primary/5 -z-10" />

            <div className="container px-4 md:px-6 mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
                        Ready to streamline your payments?
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Join efficient organizations using Stellar BatchPay to save time and fees.
                        Open source, secure, and free to get started.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link href="/demo">
                            <Button size="lg" className="h-14 px-8 text-lg rounded-full">
                                Start Sending Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="https://github.com/jahrulezfrancis/Stellar-Batch-Pay" target="_blank">
                            <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full">
                                View Source Code
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
