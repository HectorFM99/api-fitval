import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { StaffGuard } from './staff.guard';

describe('StaffGuard', () => {
  const fakeUsersService = { findById: jest.fn() };
  const guard = new StaffGuard(fakeUsersService as any);

  beforeEach(() => {
    fakeUsersService.findById.mockReset();
  });

  it('deja pasar al personal', async () => {
    fakeUsersService.findById.mockResolvedValue({ id: 1, role: 'staff' });

    const result = guard.canActivate({
      switchToHttp: () => ({
        getRequest: () => ({ user: { sub: 1 } }),
      }),
    } as any);

    await expect(result).resolves.toBe(true);
  });

  it('no deja pasar a un socio', async () => {
    fakeUsersService.findById.mockResolvedValue({ id: 1, role: 'member' });

    const result = guard.canActivate({
      switchToHttp: () => ({
        getRequest: () => ({ user: { sub: 1 } }),
      }),
    } as any);

    await expect(result).rejects.toThrow(ForbiddenException);
  });

  it('el usuario ya no existe', async () => {
    fakeUsersService.findById.mockResolvedValue(undefined);

    const result = guard.canActivate({
      switchToHttp: () => ({
        getRequest: () => ({ user: { sub: 1 } }),
      }),
    } as any);

    await expect(result).rejects.toThrow(UnauthorizedException);
  });
});
