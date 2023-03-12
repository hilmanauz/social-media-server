import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private PostRepository: Repository<Post>,
    private userServices: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto, id: number) {
    const user = await this.userServices.findById(id);
    const posted = this.PostRepository.create({ ...createPostDto });
    posted.author = user;
    await this.PostRepository.save(posted);
    delete posted.author.password;
    return posted;
  }

  async findAll(): Promise<Post[]> {
    try {
      return await this.PostRepository.createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.comments', 'comment')
        .leftJoinAndSelect('comment.user', 'user')
        .getMany();
    } catch (error) {
      return error;
    }
  }

  async findOne(id: number): Promise<Post> {
    try {
      const post = await this.PostRepository.findOne({
        relations: ['author'],
        where: {
          id,
        },
      });
      return post;
    } catch (error) {
      return error;
    }
  }

  findImage(imageId: string): Promise<Post> {
    try {
      return this.PostRepository.findOne({
        where: {
          photo: imageId,
        },
      });
    } catch (error) {}
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    try {
      const post = await this.PostRepository.findOneByOrFail({ id });
      post.caption = updatePostDto.caption || post.caption;
      return this.PostRepository.save(post);
    } catch (error) {
      return error;
    }
  }

  remove(id: number) {
    try {
      return this.PostRepository.delete({ id });
    } catch (error) {
      return error;
    }
  }
}
