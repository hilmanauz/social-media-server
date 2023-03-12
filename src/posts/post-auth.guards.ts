import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { PostsService } from './posts.service';

@Injectable()
export class PostAuthGuard implements CanActivate {
  constructor(
    private userService: UsersService,
    private postService: PostsService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params }: { user: User; params: { id: number } } = request;
    if (!user || !params) return false;
    try {
      const userPosted = await this.userService.findById(user.id);
      const updatingPost = await this.postService.findOne(+params.id);
      return userPosted.id === updatingPost.author.id;
    } catch (error) {
      throw new Error('Method not implemented.');
    }
  }
}
