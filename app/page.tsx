import QuoteCalculator from "@/app/components/QuoteCalculator";

export default function QuotePage() {
  return (
    <main className="min-h-screen bg-[#2A2A29] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Yard Cleaning & Lawn Care
          </h1>
          <p className="text-gray-400">Get your free estimate instantly</p>
        </div>
        <QuoteCalculator />
      </div>
    </main>
  );
}
