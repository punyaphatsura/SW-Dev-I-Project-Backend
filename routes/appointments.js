import express from "express";
import { getAppointments, getAppointment, addAppointment, updateAppointment, deleteAppointment } from '../controllers/appointments';
import { protect, authorize } from '../middleware/auth';

const router = express.Router({mergeParams:true});

router.route('/')
    .get(protect,getAppointments)
    .post(protect,authorize('admin','user'),addAppointment);
router.route('/:id')
    .get(protect,getAppointment)
    .put(protect,authorize('admin','user'),updateAppointment)
    .delete(protect,authorize('admin','user'),deleteAppointment);

export { router };
