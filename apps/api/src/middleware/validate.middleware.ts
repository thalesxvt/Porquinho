import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error: any) {
      if (error instanceof ZodError || error?.name === 'ZodError' || Array.isArray(error?.errors)) {
        const details: Record<string, string[]> = {}
        const errors = error.errors || []
        errors.forEach((err: any) => {
          const key = err.path?.join('.') || 'root'
          if (!details[key]) details[key] = []
          details[key].push(err.message)
        })
        res.status(400).json({ error: 'Dados inválidos', details })
        return
      }
      next(error)
    }
  }
}
