"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const metrics = [
  { value: "0.001 XLM", label: "Network Fee" },
  { value: "0.5%", label: "Service Fee" },
  { value: "$0", label: "Setup Cost" },
];

export function PayPerTransaction() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border border-[#252B3D] bg-[#111827] p-10 md:p-14 text-center overflow-hidden"
        >
          {/* Subtle glow effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#00D98B08] rounded-full blur-[80px]" />
          </div>

          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00D98B1A] border border-[#00D98B33]"
          >
            <Zap className="h-8 w-8 text-[#00D98B]" />
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight"
          >
            Pay Per Transaction
          </motion.h2>

          {/* Supporting text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[#8B92B0] text-base sm:text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Pay a small fee per transaction. The more you send, the more you
            save.
          </motion.p>

          {/* Pricing metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 max-w-3xl mx-auto relative z-10">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.25 + index * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-[#00D98B] tracking-tight">
                  {metric.value}
                </span>
                <span className="text-sm sm:text-base text-[#8B92B0] font-medium">
                  {metric.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
