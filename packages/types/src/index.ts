export * from './transaction'
export * from './category'
export * from './auth'
export * from './reports'

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  details?: Record<string, string[]>
}
