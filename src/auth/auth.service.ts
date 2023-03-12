import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import passwordHelper from '../helpers/password-helper';

@Injectable()
export class AuthService {
  constructor(
    private userServices: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userServices.findOne(username);
    const comparedPassword = passwordHelper.comparedPassword(
      password,
      user.password,
    );

    if (user && comparedPassword) {
      return {
        id: user.id,
        username: user.username,
      };
    }
    return null;
  }

  login(user: User) {
    return {
      access_token: this.jwtService.sign(user),
    };
  }
}
