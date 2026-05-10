import { DollarSign } from 'lucide-react'

const FINANCING_URL = 'https://www.startyourcreditapproval.com/credit-application/DC5W7?utm_medium=qr_code&utm_source=dealer&utm_campaign=credit_app'

export default function FinancingBanner() {
  return (
    <div className="bg-[#5BB8F5] text-white py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
        <DollarSign className="w-5 h-5 shrink-0" />
        <p className="font-semibold text-sm sm:text-base">
          We Offer Financing Options!{' '}
          <a
            href={FINANCING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/80 font-bold ml-1"
          >
            Apply for Credit Approval Now →
          </a>
        </p>
      </div>
    </div>
  )
}
