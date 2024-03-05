/* eslint-disable no-param-reassign */
import AppError from '../utils/appError.js';

const handleCastErrorDB = (err) => {
  const message = `${err.path} ${err.value} invalide.`;
  return new AppError(message, 400);
};

const handleCastDuplicateDB = (err) => {
  const value = err.keyValue.name || err.keyValue.email;
  const message = `la valeur  ${value} existe deja.Veuillez en choisir une autre.`;
  return new AppError(message, 400);
};

const handleCastValidateDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Donnee(s) invalide(s). ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Connexion invalide.Veuillez vous reconnecter', 401);
const handleJWTExpirationError = () => new AppError('Connexion expiree.Veuillez vous reconnecter', 401);

const devError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      err,
      message: err.message ?? 'erreur server',
      stack: err.stack,
    });
  } else {
    return res.status(err.statusCode).render('error', {
      title: 'Error',
      msg: err.message
    })
  }

}
const prodError = (err, req, res) => {

  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperationnal) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message ?? 'erreur server',
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',

    });
  }


  if (err.isOperationnal) {
    return res.status(err.statusCode).render('error', {
      title: 'error',
      msg: err.message ?? 'erreur server',
    });
  }
  return res.status(500).render('error', {
    title: 'error',
    msg: 'Please try again later',
  });
};

// eslint-disable-next-line no-unused-vars
export default (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    err.statusCode = err.statusCode ?? 500;
    err.status = err.status ?? 'error';
    return devError(err, req, res);
  }

  let error = { ...err, name: err.name };
  error.statusCode = err.statusCode ?? 500;
  error.status = err.status ?? 'error';
  error.message = err.message ?? 'Try again';
  if (error.name === 'CastError') {
    error = handleCastErrorDB(error);
  }
  if (error.name === 'ValidationError') error = handleCastValidateDB(error);
  if (error.code === 11000) { error = handleCastDuplicateDB(error); }

  if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
  if (error.name === 'TokenExpiredError') error = handleJWTExpirationError(error);

  return prodError(err, req, res);
};
