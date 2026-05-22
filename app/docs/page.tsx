import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-[70vh] text-white">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Documentation</h1>
      <p className="mb-6 text-gray-300">
        This is the public documentation gateway for Stellar BatchPay. Use the dashboard docs for product-specific guides.
      </p>

      <div className="space-y-3">
        <Link href="/dashboard/docs" className="inline-block rounded-lg border border-[#1F2937] bg-[#0B1220] px-4 py-2 text-[#00D98B] hover:bg-[#0F1E32]">
          Go to Dashboard Documentation
        </Link>
      </div>
    </div>
  )
}
