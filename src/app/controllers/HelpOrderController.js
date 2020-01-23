import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const studentExists = await Student.findByPk(req.params.id);

    if (!studentExists) {
      return res.status(400).json({ error: 'This student does not exists' });
    }

    const { question, answer, answer_at } = req.body;

    if (answer || answer_at) {
      return res
        .status(400)
        .json({ error: 'Only the GYM can answer questions' });
    }

    await HelpOrder.create({ student_id: req.params.id, question });

    return res.json({
      student_id: req.params.id,
      question,
    });
  }

  async index(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: { student_id: req.params.id },
      attributes: ['id', 'question', 'answer'],
      order: [['created_at', 'DESC']],
    });

    return res.json(helpOrders);
  }
}

export default new HelpOrderController();
