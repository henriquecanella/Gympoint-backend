import * as Yup from 'yup';
import { isBefore, parseISO, addMonths } from 'date-fns';

import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import Student from '../models/Student';

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const checkEnrollment = await Enrollment.findOne({
      where: { student_id },
    });

    if (checkEnrollment) {
      return res
        .status(400)
        .json({ error: 'This student already have an enrollment' });
    }

    const studentExists = await Student.findOne({ where: { id: student_id } });

    if (!studentExists) {
      return res.status(400).json({ error: 'This student does not exists' });
    }

    const checkPlan = await Plan.findOne({ where: { id: plan_id } });

    if (!checkPlan) {
      return res.status(400).json({ error: 'This plan does not exists' });
    }

    if (isBefore(parseISO(start_date), new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const end_date = addMonths(parseISO(start_date), checkPlan.duration);
    const price = checkPlan.price * checkPlan.duration;

    await Enrollment.create({
      price,
      start_date,
      end_date,
      student_id,
      plan_id,
    });

    return res.json({
      price,
      start_date,
      end_date,
      student_id,
      plan_id,
    });
  }

  async index(req, res) {
    return res.json();
  }

  async update(req, res) {
    return res.json();
  }

  async delete(req, res) {
    return res.json();
  }
}

export default new EnrollmentController();
