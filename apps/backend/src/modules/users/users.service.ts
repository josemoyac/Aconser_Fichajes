import { Injectable } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByOidcSub(oidcSub: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { oidcSub } });
  }

  async ensureUserFromOidc(data: {
    email: string;
    name: string;
    oidcSub: string;
    role?: Role;
  }): Promise<User> {
    const existing = await this.findByOidcSub(data.oidcSub);
    if (existing) {
      if (!existing.active) {
        throw new Error('Usuario inactivo');
      }
      return existing;
    }
    const created = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        oidcSub: data.oidcSub,
        role: data.role ?? Role.EMPLOYEE,
        active: true
      }
    });
    return created;
  }

  list(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: { name: 'asc' } });
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }
}
