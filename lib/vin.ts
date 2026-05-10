import { VinData } from '@/types'

export async function lookupVin(vin: string): Promise<VinData | null> {
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`
    )
    const data = await res.json()
    const result = data.Results?.[0]
    if (!result || result.ErrorCode !== '0') return null

    return {
      year: result.ModelYear || '',
      make: result.Make || '',
      model: result.Model || '',
      trim: result.Trim || '',
      engine: result.DisplacementL
        ? `${parseFloat(result.DisplacementL).toFixed(1)}L ${result.EngineCylinders}-cyl`
        : '',
      transmission: result.TransmissionStyle || '',
      drivetrain: result.DriveType || '',
      body_type: result.BodyClass || '',
    }
  } catch {
    return null
  }
}
