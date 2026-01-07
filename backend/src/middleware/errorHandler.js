// Middleware de tratamento de erros global
export const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', err);

  // Erro de validação do express-validator
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Erro de validação',
      details: err.array(),
    });
  }

  // Erro do MySQL
  if (err.code && err.code.startsWith('ER_')) {
    // Duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_ENTRY',
        message: 'Registro duplicado',
        details: err.sqlMessage,
      });
    }

    // Foreign key constraint
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REFERENCE',
        message: 'Referência inválida',
        details: err.sqlMessage,
      });
    }

    // Outros erros SQL
    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Erro no banco de dados',
      details: process.env.NODE_ENV === 'development' ? err.sqlMessage : undefined,
    });
  }

  // Erro padrão
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    error: err.name || 'INTERNAL_ERROR',
    message: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

// Middleware para rotas não encontradas
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Rota ${req.method} ${req.path} não encontrada`,
  });
};
