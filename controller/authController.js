/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import pkg from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { Email } from '../utils/email.js';
import catchAsync from '../utils/catchAsync.js';

const { sign, verify } = pkg;

const signToken = (id) => sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});

const createAndSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now + process.env.JWT_COOKIES_EXPIRES_IN),
    httpOnly: true,
    secure: req.secure || req.headers('x-forwarded-proto') === 'https'
  };


  // eslint-disable-next-line no-param-reassign
  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  return res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};


export const isLogged = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const header = req.headers.authorization.split(' ');
    // eslint-disable-next-line prefer-destructuring
    token = header[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return next(new AppError("Vous n'etes pas connecte", 401));
  }

  const decode = await promisify(verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decode.id);

  if (!currentUser) return next(new AppError("L'utilisateur associe a cette connexion n'existe pas", 401));

  if (currentUser.changePasswordAfter(decode.iat)) {
    return next(new AppError('Le nouveau mot de passe a change.Veuillez vous reconnecter', 401));
  }

  req.user = currentUser;
  res.locals.user = currentUser

  return next();
});

export const isLoggedIn = async (req, res, next) => {

  try {
    if (req.cookies.jwt) {

      const decode = await promisify(verify)(req.cookies.jwt, process.env.JWT_SECRET);

      const currentUser = await User.findById(decode.id);

      if (!currentUser) {
        return next();
      }

      if (currentUser.changePasswordAfter(decode.iat)) {
        return next();
      }

      res.locals.user = currentUser;

      return next();
    }
    return next();
  } catch (error) {
    return next()
  }


};

export const signup = async (req, res) => {

  const newUser = await User.create(req.body);


  const url = `${req.protocol}://${req.get('host')}/me`

  await new Email(newUser, url).sendWelcome()

  return createAndSendToken(newUser, 201, req, res);
};
export const login = async (req, res, next) => {

  const { email, password } = req.body;

  if (!password || !email) {
    return next(new AppError("Le mot de passe et l'email sont obligatoire", 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Le mot de passe ou l'utilisateur est incorrect", 401));
  }

  return createAndSendToken(user, 200, req, res);
};

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' })
}

export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Permission refuse', 403));
  }
  return next();
};
export const forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('Aucune utilisateur avec cette adresse', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save();

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email({
      user, resetURL
    }).sendPasswordReset();

    return res.status(200).json({
      status: 'success',
      message: 'Token envoye',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    return next(new AppError('Erreur au moment de l\'envoi du mail. Reessayer plus tard,500'));
  }
};
export const resetPassword = async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

  if (!user) {
    return next(new AppError('Lien expirer ou incorrect. Veuillez refaire la demande', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  try {
    await user.save();

    return createAndSendToken(user, 201, req, res);
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const updatePasssword = async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  const currentUser = await User.findById(req.user.id).select('+password');

  const isCorrect = await currentUser.correctPassword(currentPassword, currentUser.password);

  if (!isCorrect) {
    return next(new AppError('Mot de passe incorrect', 401));
  }
  currentUser.password = newPassword;
  currentUser.passwordConfirm = newPasswordConfirm;
  await currentUser.save();

  return createAndSendToken(currentUser, 201, req, res);
};

