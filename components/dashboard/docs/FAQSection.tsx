"use client";

import { useState } from "react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 1,
    question: "How do batch payments work on Stellar?",
    answer:
      "Batch payments on Stellar allow you to send multiple payments in a single transaction. You can bundle up to 100 payment operations into one transaction envelope, significantly reducing fees and processing time compared to individual transfers. Each recipient receives their funds simultaneously when the transaction is confirmed on the network.",
  },
  {
    id: 2,
    question: "What are the transaction fees?",
    answer:
      "Stellar transaction fees are extremely low — typically 0.00001 XLM (one stroop) per operation. For batch payments, the fee is calculated per operation within the transaction. Even with 100 operations in a single batch, the total cost remains a fraction of a cent, making Stellar ideal for high-volume payment scenarios.",
  },
  {
    id: 3,
    question: "How are failed payments handled?",
    answer:
      "If a batch transaction fails, the entire transaction is rolled back atomically — no partial payments are made. This ensures consistency across all recipients. Common failure reasons include insufficient XLM balance, invalid destination addresses, or accounts that haven't been activated. Failed transactions are flagged in your dashboard with detailed error codes so you can retry or correct individual entries.",
  },
  {
    id: 4,
    question: "What's the difference between testnet and mainnet?",
    answer:
      "The testnet is a sandbox environment that mirrors the Stellar mainnet but uses test XLM with no real monetary value. It's ideal for development, integration testing, and experimenting with batch configurations. The mainnet is the live production network where transactions involve real assets. Always validate your batch logic thoroughly on testnet before executing on mainnet.",
  },
];

interface FAQAccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function FAQAccordionItem({ item, isOpen, onToggle, index }: FAQAccordionItemProps) {
  return (
    <div
      className={`faq-item ${isOpen ? "faq-item--open" : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button
        className="faq-trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${item.id}`}
        id={`faq-trigger-${item.id}`}
      >
        <span className="faq-question">{item.question}</span>
        <span className="faq-icon" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="chevron-svg"
          >
            <path
              d="M4 6.5L9 11.5L14 6.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div
        id={`faq-answer-${item.id}`}
        role="region"
        aria-labelledby={`faq-trigger-${item.id}`}
        className="faq-body"
      >
        <div className="faq-answer">
          <p>{item.answer}</p>
        </div>
      </div>

      <style>{`
        .faq-item {
          background: #131c2e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          animation: fadeSlideIn 0.35s ease both;
        }
        .faq-item:hover {
          border-color: rgba(255, 255, 255, 0.14);
        }
        .faq-item--open {
          border-color: rgba(52, 211, 153, 0.25);
          box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.1);
        }

        .faq-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 24px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          color: #e2e8f0;
          transition: color 0.15s;
        }
        .faq-trigger:focus-visible {
          outline: 2px solid #34d399;
          outline-offset: -2px;
          border-radius: 10px;
        }

        .faq-question {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.45;
          color: #e2e8f0;
          letter-spacing: -0.01em;
        }

        .faq-icon {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #94a3b8;
          transition: background 0.2s, color 0.2s;
        }
        .faq-item--open .faq-icon {
          background: rgba(52, 211, 153, 0.15);
          color: #34d399;
        }

        .chevron-svg {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .faq-item--open .chevron-svg {
          transform: rotate(180deg);
        }

        .faq-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .faq-item--open .faq-body {
          grid-template-rows: 1fr;
        }

        .faq-answer {
          overflow: hidden;
        }
        .faq-answer p {
          padding: 0 24px 20px;
          margin: 0;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 14px;
          line-height: 1.7;
          color: #94a3b8;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 16px;
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="faq-section">
      {/* Header */}
      <div className="faq-header">
        <span className="faq-header-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#34d399" />
            <text
              x="10"
              y="14.5"
              textAnchor="middle"
              fill="#0d1117"
              fontSize="12"
              fontWeight="700"
              fontFamily="system-ui"
            >
              ?
            </text>
          </svg>
        </span>
        <h2 className="faq-header-title">Frequently Asked Questions</h2>
      </div>

      {/* Accordion List */}
      <div className="faq-list" role="list">
        {FAQ_DATA.map((item, index) => (
          <FAQAccordionItem
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() => handleToggle(item.id)}
            index={index}
          />
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .faq-section {
          width: 100%;
          padding: 32px;
          background: #111827;
          border-radius: 16px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .faq-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        .faq-header-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        .faq-header-title {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (max-width: 640px) {
          .faq-section {
            padding: 20px 16px;
          }
          .faq-header-title {
            font-size: 17px;
          }
        }
      `}</style>
    </section>
  );
}