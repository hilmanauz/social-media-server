import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsService } from 'src/posts/posts.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private CommentRepository: Repository<Comment>,
    private userServices: UsersService,
    private postServices: PostsService,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    postId: number,
    userId: number,
  ) {
    const user = await this.userServices.findById(userId);
    const post = await this.postServices.findOne(postId);
    const comment = this.CommentRepository.create({ ...createCommentDto });
    comment.user = user;
    comment.post = post;
    await this.CommentRepository.save(comment);
    delete comment.user.password;
    return comment;
  }

  // findAll() {
  //   return `This action returns all comments`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} comment`;
  // }

  // update(id: number, updateCommentDto: UpdateCommentDto) {
  //   return `This action updates a #${id} comment`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} comment`;
  // }
}
