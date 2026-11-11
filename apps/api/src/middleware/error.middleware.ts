import { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Error] ${err.message}`, err.stack)

  if (err.name === 'ZodError' || Array.isArray(err.errors)) {
    const details: Record<string, string[]> = {}
    const errors = err.errors || []
    errors.forEach((e: any) => {
      const key = e.path?.join('.') || 'root'
      if (!details[key]) details[key] = []
      details[key].push(e.message)
    })
    res.status(400).json({ error: 'Dados inválidos', details })
    return
  }

  if (err.message?.includes('Unique constraint')) {
    res.status(409).json({ error: 'Registro já existe' })
    return
  }

  if (err.message?.includes('Record to update not found') ||
      err.message?.includes('Record to delete does not exist')) {
    res.status(404).json({ error: 'Registro não encontrado' })
    return
  }

  res.status(500).json({ error: 'Erro interno do servidor' })
}
