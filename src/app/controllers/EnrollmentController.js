import * as Yup from 'yup';
import { isBefore, parseISO, addMonths } from 'date-fns';

import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import Student from '../models/Student';

import EnrollmentMail from '../jobs/EnrollmentMail';
import Queue from '../../lib/Queue';

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

    const enrollment = await Enrollment.create({
      price,
      start_date,
      end_date,
      student_id,
      plan_id,
    });

    await Queue.add(EnrollmentMail.key, {
      student: studentExists,
      plan: checkPlan,
      enrollment,
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
    const enrollments = await Enrollment.findAll({
      attributes: ['student_id', 'plan_id', 'start_date', 'end_date', 'price'],
      order: [['created_at', 'DESC']],
    });

    return res.json(enrollments);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const enrollment = await Enrollment.findByPk(req.params.id);
    const plan = await Plan.findByPk(enrollment.plan_id);

    const { plan_id, start_date } = req.body;

    let price;
    let end_date;
    const checkPlan = plan_id
      ? await Plan.findOne({ where: { id: plan_id } })
      : null;

    if (plan_id && plan_id !== enrollment.plan_id) {
      if (!checkPlan) {
        return res.status(400).json({ error: 'This plan does not exists' });
      }

      price = checkPlan.price * checkPlan.duration;
    } else {
      price = enrollment.price;
    }

    if (start_date && start_date !== enrollment.start_date) {
      if (isBefore(parseISO(start_date), new Date())) {
        return res.status(400).json({ error: 'Past dates are not permitted' });
      }
      end_date = addMonths(
        parseISO(start_date),
        plan_id ? checkPlan.duration : plan.duration
      );
    } else {
      end_date = addMonths(
        enrollment.start_date,
        plan_id ? checkPlan.duration : plan.duration
      );
    }

    const initial_date = start_date || enrollment.start_date;

    await enrollment.update({
      price,
      start_date: initial_date,
      end_date,
      plan_id,
    });

    return res.json({
      price,
      start_date: initial_date,
      end_date,
      plan_id,
    });
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id);

    await enrollment.destroy();

    return res.json({ message: `Enrollment: ${enrollment.id} deleted` });
  }
}

export default new EnrollmentController();
