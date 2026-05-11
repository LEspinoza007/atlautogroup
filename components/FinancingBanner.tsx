import { DollarSign } from 'lucide-react'

const FINANCING_URL = 'https://www.startyourcreditapproval.com/credit-application/DC5W7?utm_medium=qr_code&utm_source=dealer&utm_campaign=credit_app'

export default function FinancingBanner() {
  return (
    <div className="bg-[#5BB8F5] text-white py-3 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 shrink-0" />
          <span className="font-semibold text-xs sm:text-sm">We Offer Financing!</span>
        </div>
        <a
          href={FINANCING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-white/80 font-bold text-xs sm:text-sm"
        >
          Apply for Credit Approval Now →
        </a>
      </div>
    </div>
  )
}
