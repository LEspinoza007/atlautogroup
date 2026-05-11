export type VehicleStatus = 'available' | 'sold' | 'sale' | 'clearance'

export type Vehicle = {
  id: string
  vin: string
  year: number
  make: string
  model: string
  trim: string
  color: string
  interior_color: string
  mileage: number
  price: number
  sale_price?: number
  is_sale?: boolean
  status: VehicleStatus
  description: string
  transmission: string
  drivetrain: string
  engine: string
  features: string
  title_status: string
  images: string[]
  thumbnail_index: number
  featured: boolean
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

export type Appointment = {
  id: string
  vehicle_id: string
  client_first_name: string
  client_last_name: string
  client_phone: string
  client_email?: string
  appointment_date: string
  appointment_time: string
  dnc_promotional: boolean
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  notes?: string
  created_at: string
  vehicles?: { id: string; year: number; make: string; model: string }
}

export type BusinessHours = {
  id: string
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

export type BlackoutDate = {
  id: string
  date: string
  reason?: string
}

export type ProcurementRequest = {
  id: string
  make?: string
  model?: string
  trim?: string
  year_min?: number
  year_max?: number
  color?: string
  max_mileage?: number
  budget?: number
  notes?: string
  client_first_name: string
  client_last_name: string
  client_phone: string
  client_email?: string
  status: 'new' | 'in_progress' | 'found' | 'closed'
  created_at: string
}
