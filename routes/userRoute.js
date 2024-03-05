import { Router } from 'express';

import {
  getAllUsers, createUser, getUser, updateUser, deleteUser, updateCurrent, deleteCurrent,
  getCurrent, uploadUserPhoto,
  resizeUserPhoto,
} from '../controller/userController.js';

import catchAsync from '../utils/catchAsync.js';
import {
  isLogged, resetPassword, login, signup, forgotPassword, updatePasssword, restrictTo,
  logout,
} from '../controller/authController.js';

const userRouter = Router();


// Methode de connexion
userRouter.post('/signup', catchAsync(signup));
userRouter.post('/login', catchAsync(login));
userRouter.get('/logout', logout)

//  Methode de gestion de mot de passe
userRouter.post('/forgotPassword', catchAsync(forgotPassword));
userRouter.patch('/resetPassword/:token', catchAsync(resetPassword));

userRouter.use(isLogged);

userRouter.patch('/updatePassword', catchAsync(updatePasssword));

// Methode sur l'utilisateur courant
userRouter.get('/me', getCurrent, catchAsync(getUser));
userRouter.patch('/updateCurrent', uploadUserPhoto, catchAsync(resizeUserPhoto), catchAsync(updateCurrent));
userRouter.delete('/deleteCurrent', catchAsync(deleteCurrent));

userRouter.use(restrictTo('admin'));

userRouter.route('/')
  .get(catchAsync(getAllUsers))
  .post(catchAsync(createUser));

userRouter.route('/:id')
  .get(catchAsync(getUser))
  .patch(catchAsync(updateUser))
  .delete(catchAsync(deleteUser));

export default userRouter;
