import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class EnrollmentMail {
  get key() {
    return 'EnrollmentMail';
  }

  async handle({ data }) {
    const { student, plan, enrollment } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matrícula efetuada com sucesso',
      template: 'enrollment',
      context: {
        student: student.name,
        plan: plan.title,
        price: `R$${enrollment.price}`,
        start_date: format(parseISO(enrollment.start_date), "dd 'de' MMMM", {
          locale: pt,
        }),
        end_date: format(parseISO(enrollment.end_date), "dd 'de' MMMM", {
          locale: pt,
        }),
      },
    });
  }
}

export default new EnrollmentMail();
