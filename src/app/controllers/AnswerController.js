import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';

class AnswerController {
  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const helpOrder = await HelpOrder.findByPk(req.params.id);

    if (!helpOrder) {
      return res.status(400).json({ error: 'This Help Order does not exists' });
    }

    const { student_id, question, answer } = req.body;

    if (student_id || question) {
      return res.status(400).json({ error: 'You cannot update this' });
    }

    helpOrder.answer = answer;
    helpOrder.answer_at = new Date();

    await helpOrder.save();

    return res.json(helpOrder);
  }
}

export default new AnswerController();
