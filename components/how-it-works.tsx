'use client';

import { motion } from "framer-motion";
import { Upload, Wallet, Send } from "lucide-react";

const steps = [
    {
        icon: <Upload className="w-8 h-8 text-primary" />,
        title: "Upload CSV",
        description: "Prepare your payment list with addresses and amounts using our simple template."
    },
    {
        icon: <Wallet className="w-8 h-8 text-primary" />,
        title: "Connect Wallet",
        description: "Securely connect your Stellar wallet. Your private keys never leave your device."
    },
    {
        icon: <Send className="w-8 h-8 text-primary" />,
        title: "Batch Send",
        description: "One click to sign and send. We bundle transactions to minimize fees and maximize speed."
    }
];

export function HowItWorks() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold tracking-tighter mb-4"
                    >
                        How it <span className="text-primary">Works</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground"
                    >
                        Three simple steps to process thousands of payments.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="flex flex-col items-center text-center bg-background"
                        >
                            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6 border-4 border-background shadow-lg relative z-10">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed max-w-xs">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
