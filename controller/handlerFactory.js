import AppError from "../utils/appError.js";
import APIFeatures from '../utils/apiFeatures.js';

export const deleteOne = Model => async (req, res, next) => {
  const { id } = req.params;

  const doc = await Model.findByIdAndDelete(id);

  if (!doc) {
    return next(new AppError('Aucun  document  avec cet identifiant', 404));
  }

  return res.status(204).json({
    status: 'success',
    data: null,
  });
};

export const updateOne = Model => async (req, res, next) => {
  const { id } = req.params;
  const doc = await Model.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError('Aucun voyage avec cet identifiant', 404));
  }

  return res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
};

export const createOne = Model => async (req, res) => {

  const newDoc = new Model(req.body);
  await newDoc.save();
  return res.status(201).json({
    status: 'success',
    data: {
      data: newDoc,
    },
  });
};

export const getOne = (Model, popOptions) => async (req, res, next) => {
  // eslint-disable-next-line max-len
  // const id = req.params.id  * 1;  // permet la transformation instantané d'un nombre dans un type string en Number
  const { id } = req.params;

  let query = Model.findById(id)
  if (popOptions) query = query.populate(popOptions)

  const doc = await query;


  if (!doc) {
    return next(new AppError('Aucun document avec cet identifiant', 404));
  }

  return res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
};

export const getAll = Model => async (req, res) => {

  let filter = {}
  if (req.params.tourId) filter = { tour: req.params.tourId }

  const features = new APIFeatures(Model.find(filter), req.query)
    .filter() // FILTER
    .sort() // SORT
    .limiteFields() // LIMIT
    .paginate(); // Pagination 

  // const docs = await features.query.explain();
  const docs = await features.query

  return res.status(200).json({
    status: 'success',
    result: docs.length,
    data: {
      data: docs,
    },
  });
};
