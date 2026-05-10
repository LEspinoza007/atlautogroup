export type VehicleStatus = 'available' | 'sold'

export type Vehicle = {
  id: string
  vin: string
  year: number
  make: string
  model: string
  trim: string
  color: string
  mileage: number
  price: number
  status: VehicleStatus
  description: string
  images: string[]
  created_at: string
  updated_at: string
}

export type UserRole = 'admin' | 'employee'

export type Profile = {
  id: string
  email: string
  full_name: string
  role: UserRole
}

export type VinData = {
  year: string
  make: string
  model: string
  trim: string
  engine: string
  transmission: string
  drivetrain: string
  body_type: string
}
