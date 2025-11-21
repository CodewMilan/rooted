import ScannerView from '@/components/ScannerView'

export default function ScannerPage() {
  return (
    <div className="page-container">
      <div className="scanner-page">
        <ScannerView />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'AuthenTIX Scanner',
  description: 'Scan QR codes to verify event tickets'
}
