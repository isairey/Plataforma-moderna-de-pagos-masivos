"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "What is Stellar Batch Pay?",
    answer:
      "Stellar Batch Pay is a platform that allows you to send payments to multiple recipients in a single transaction on the Stellar blockchain. It is designed for payroll, airdrops, grant distributions, and any scenario where you need to pay many people at once.",
  },
  {
    question: "How are transaction fees calculated?",
    answer:
      "Each transaction incurs a small network fee of 0.001 XLM (set by the Stellar network) plus a 0.5% service fee on the total batch amount. There are no setup costs, monthly subscriptions, or hidden charges.",
  },
  {
    question: "Which assets can I use for batch payments?",
    answer:
      "You can send any asset available on the Stellar network, including XLM, USDC, and other Stellar-based tokens. The recipient must have a trustline set up for non-native assets.",
  },
  {
    question: "Is there a limit on how many recipients I can include?",
    answer:
      "The Starter plan supports up to 50 recipients per batch. The Professional plan supports up to 500, and the Enterprise plan offers unlimited recipients. You can upgrade or downgrade your plan at any time.",
  },
  {
    question: "How do I upload my recipient list?",
    answer:
      "You can upload a CSV file with recipient addresses and amounts, or use our API to submit batch payment data programmatically. The platform validates all addresses before processing to prevent errors.",
  },
  {
    question: "What happens if a payment fails?",
    answer:
      "If a payment to a specific recipient fails (for example, due to an invalid address or missing trustline), the rest of the batch continues processing. Failed payments are flagged in your transaction history so you can retry them individually.",
  },
  {
    question: "Can I use Batch Pay on mainnet and testnet?",
    answer:
      "Yes. All plans include testnet access for development and testing. Mainnet access is available on the Professional and Enterprise plans. The Starter plan is testnet-only.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply connect your Stellar wallet, upload a CSV file or enter recipient details, review the batch summary, and confirm. Your payments are processed within seconds on the Stellar network.",
  },
];

export function FaqSection() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="max-w-[800px] mx-auto px-6 sm:px-8 md:px-12">
        {/* Section header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4"
          >
            Frequently Asked{" "}
            <span className="text-[#00D98B]">Questions</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[#8B92B0] text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Everything you need to know about Stellar Batch Pay.
          </motion.p>
        </div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="rounded-2xl border border-[#252B3D] bg-[#111827] px-6 overflow-hidden transition-colors data-[state=open]:border-[#00D98B33]"
              >
                <AccordionTrigger className="py-5 text-base font-semibold text-white hover:no-underline hover:text-[#00D98B] transition-colors [&[data-state=open]]:text-[#00D98B]">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#8B92B0] text-sm leading-relaxed pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
