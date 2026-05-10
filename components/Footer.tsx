import { MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-2">ATL Auto Group</h3>
          <p className="text-sm text-gray-400">Quality pre-owned vehicles in San Antonio. ATL Logistics LLC.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact Us</h4>
          <div className="space-y-2 text-sm">
            <a
              href="tel:+19566947000"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4 text-red-400" />
              (956) 694-7000
            </a>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <span>
                2379 Northeast Interstate 410 Loop<br />
                San Antonio, TX 78217
              </span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Financing</h4>
          <p className="text-sm text-gray-400 mb-2">Get pre-approved quickly — we work with all credit types.</p>
          <a
            href="https://www.startyourcreditapproval.com/credit-application/DC5W7?utm_medium=qr_code&utm_source=dealer&utm_campaign=credit_app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Apply Now
          </a>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ATL Auto Group · ATL Logistics LLC · San Antonio, TX
      </div>
    </footer>
  )
}
