import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import passwordHelper from 'src/helpers/password-helper';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private UserRepository: Repository<User>,
  ) {}
  create(createUserDto: CreateUserDto) {
    const query = {
      ...createUserDto,
      password: passwordHelper.hashPassword(createUserDto.password),
    };
    const newUser = this.UserRepository.create(query);
    return this.UserRepository.save(newUser);
  }

  findAll() {
    return `This action returns all users`;
  }

  findById(id: number): Promise<User> {
    try {
      return this.UserRepository.findOne({
        where: {
          id,
        },
        relations: ['posts'],
      });
    } catch (error) {
      return error;
    }
  }

  findOne(username: string) {
    try {
      return this.UserRepository.findOneByOrFail({
        username,
      });
    } catch (error) {
      return error;
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
