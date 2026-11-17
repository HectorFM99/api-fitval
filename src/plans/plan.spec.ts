import { PlanRow, toPlan } from './plan';

describe('toPlan', () => {
  it('convierte monthly_price de texto a número', () => {
    const row: PlanRow = {
      id: 1,
      name: 'Mañanas',
      monthly_price: '29.90',
    };

    const plan = toPlan(row);

    expect(plan.monthlyPrice).toBe(29.9);
    expect(plan.id).toBe(1);
    expect(plan.name).toBe('Mañanas');
  });
});
