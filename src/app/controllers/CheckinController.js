import { startOfWeek, endOfWeek } from 'date-fns';
import { Op } from 'sequelize';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res) {
    const startWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const endWeek = endOfWeek(new Date());

    const studentExists = await Student.findByPk(req.params.id);

    if (!studentExists) {
      return res.status(400).json({ error: 'This student does not exists' });
    }

    const checkCheckin = await Checkin.findAll({
      where: {
        student_id: req.params.id,
        created_at: {
          [Op.between]: [startWeek, endWeek],
        },
      },
    });

    if (checkCheckin.length >= 5) {
      return res
        .status(400)
        .json({ error: 'You can only make 5 checkins in a week' });
    }

    const checkin = await Checkin.create({ student_id: req.params.id });

    return res.json(checkin);
  }

  async index(req, res) {
    const checkins = await Checkin.findAll({
      where: { student_id: req.params.id },
      order: [['created_at', 'DESC']],
    });

    return res.json(checkins);
  }
}

export default new CheckinController();
