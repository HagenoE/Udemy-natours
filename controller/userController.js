import multer from 'multer';
import sharp from 'sharp';

import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { deleteOne, updateOne, getOne, getAll, createOne } from './handlerFactory.js';

const filterObj = (obj, ...allowedField) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedField.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

export const getAllUsers = getAll(User);
export const createUser = createOne(User);
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);

export const getCurrent = (req, res, next) => {
  req.params.id = req.user.id;

  return next()
}

export const updateCurrent = async (req, res, next) => {

  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Vous ne pouvez pas modifier le mot de passe. Utilisez le module associé', 400));
  }

  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },

  });
};
export const deleteCurrent = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  return res.status(204).json({
    status: 'success',
    data: null,
  });
};

export const getUser = getOne(User)



// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) /* req, file, callback */ => {
//     cb(null, 'public/img/users')/* cb(error, path) */
//   },
//   filename: (req, file, cb) => {
//     const [, extension] = file.mimetype.split('/');
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`)
//   }
// });

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('Not an image', 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

export const uploadUserPhoto = upload.single('photo')
export const resizeUserPhoto = async (req, res, next) => {

  if (!req.file) return next()

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`


  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)

  return next()

}

