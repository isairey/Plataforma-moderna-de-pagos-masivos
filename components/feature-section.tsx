'use client';

import { CheckCircle2, Zap, Lock, Coins, BarChart3, Globe } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        title: "Bulk CSV Upload",
        description: "Simply upload a CSV file with thousands of recipients and let us handle the rest.",
        icon: <BarChart3 className="h-6 w-6" />,
    },
    {
        title: "Multi-Asset Support",
        description: "Send XLM, USDC, or any other Stellar asset in the same batch.",
        icon: <Coins className="h-6 w-6" />,
    },
    {
        title: "Global Reach",
        description: "Pay anyone, anywhere in the world instantly without banking delays.",
        icon: <Globe className="h-6 w-6" />,
    },
    {
        title: "Bank-Grade Security",
        description: "Your secret keys are never stored. Transactions are signed locally or via secure enclave.",
        icon: <Lock className="h-6 w-6" />,
    },
    {
        title: "Real-Time Tracking",
        description: "Watch your payments settle in real-time with direct blockchain verification.",
        icon: <Zap className="h-6 w-6" />,
    },
    {
        title: "Low Fees",
        description: "Costs a fraction of a cent per transaction. Save thousands on fees.",
        icon: <CheckCircle2 className="h-6 w-6" />,
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function FeatureSection() {
    return (
        <section id="features" className="py-24 bg-secondary/30">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
                            Everything you need for <span className="text-primary">efficient payouts</span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
                            Designed for businesses, DAOs, and developers who need to move money fast.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={item}
                            whileHover={{ y: -5 }}
                            className="flex flex-col p-6 bg-background rounded-2xl border hover:shadow-lg transition-all duration-200"
                        >
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
