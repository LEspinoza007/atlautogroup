import { NextRequest, NextResponse } from 'next/server'
import { lookupVin } from '@/lib/vin'

export async function GET(request: NextRequest) {
  const vin = request.nextUrl.searchParams.get('vin')
  if (!vin || vin.length !== 17) {
    return NextResponse.json({ error: 'Invalid VIN' }, { status: 400 })
  }
  const data = await lookupVin(vin)
  if (!data) {
    return NextResponse.json({ error: 'VIN not found' }, { status: 404 })
  }
  return NextResponse.json(data)
}
