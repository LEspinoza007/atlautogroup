import { MapPin, Phone } from 'lucide-react'

const FINANCING_URL = 'https://www.startyourcreditapproval.com/credit-application/DC5W7?utm_medium=qr_code&utm_source=dealer&utm_campaign=credit_app'
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61574727189453'
const WHATSAPP_URL = 'https://wa.me/19566947000'
const MAPS_URL = 'https://maps.google.com/?q=2379+Northeast+Interstate+410+Loop,+San+Antonio,+TX+78217'

function FacebookIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-rose-600 rounded-md flex items-center justify-center font-black text-white text-xs">ATL</div>
            <h3 className="text-white font-bold">ATL Auto Group</h3>
          </div>
          <p className="text-sm text-zinc-500 mb-4">Quality pre-owned vehicles in San Antonio. ATL Logistics LLC.</p>
          <div className="flex items-center gap-3">
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"
              className="p-2 bg-zinc-800 hover:bg-blue-600 rounded-lg transition-colors text-zinc-400 hover:text-white">
              <FacebookIcon />
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="p-2 bg-zinc-800 hover:bg-green-600 rounded-lg transition-colors text-zinc-400 hover:text-white">
              <WhatsAppIcon />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Contact Us</h4>
          <div className="space-y-3 text-sm">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4 text-rose-400" />
              (956) 694-7000
              <span className="text-xs text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">WhatsApp</span>
            </a>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-2 hover:text-white transition-colors">
              <MapPin className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>2379 Northeast Interstate 410 Loop<br />San Antonio, TX 78217</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Financing</h4>
          <p className="text-sm text-zinc-500 mb-3">We work with all credit types — get pre-approved quickly.</p>
          <a href={FINANCING_URL} target="_blank" rel="noopener noreferrer"
            className="inline-block bg-rose-600 hover:bg-rose-700 text-white text-sm px-4 py-2 rounded-xl transition-colors font-semibold">
            Apply Now
          </a>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} ATL Auto Group · ATL Logistics LLC · San Antonio, TX
      </div>
    </footer>
  )
}
