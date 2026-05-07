const { AppError } = require('../utils/errors');

/**
 * Global Error Handling middleware
 * Express sẽ tự động nhận diện hàm có 4 tham số là Error Middleware.
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Chế độ Development: Trả về đầy đủ thông tin để debug
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Chế độ Production: Chỉ trả về thông tin tối thiểu & an toàn cho Client
  if (err.isOperational) {
    // Lỗi dự báo được (như 404, 401, 400)
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Lỗi hệ thống ngoài ý muốn (database error, bug code) - Không lộ chi tiết cho Client
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong on our side!',
  });
};

module.exports = globalErrorHandler;
