import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  UseGuards,
  Res,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  isFileExtensionSafe,
  removeFile,
  saveImageToStorage,
} from 'src/helpers/image-storage';
import { join } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guards';
import { PostAuthGuard } from './post-auth.guards';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard, PostAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', saveImageToStorage))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @Body() createPostDto: CreatePostDto,
  ) {
    const fileName = file?.filename;
    if (!fileName)
      return new NotFoundException(
        {},
        {
          description: 'File must be a png, jpg, jpeg',
        },
      );
    const imagesFolderPath = join(process.cwd(), 'src/images');
    const fullImagePath = join(imagesFolderPath + '/' + file.filename);

    const isValidExtension = await isFileExtensionSafe(fullImagePath);

    if (isValidExtension) {
      const userId = req.user.id;
      return this.postsService.create(
        {
          ...createPostDto,
          photo: fileName,
        },
        userId,
      );
    }
    removeFile(fullImagePath);
    return new NotFoundException(
      {},
      {
        description: 'File content does not match extension!',
      },
    );
  }

  @Get()
  async findAll() {
    return this.postsService.findAll().then((posts) => {
      return posts?.map((post) => {
        delete post.author.password;
        return {
          ...post,
          photo: `http://${
            process.env.PRIVATE_IP_ADDRESS || 'localhost'
          }:3000/posts/${post.photo}`,
        };
      });
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() res, @Request() req: any) {
    return this.postsService
      .findImage(id)
      .then((post) => res.sendFile(post.photo, { root: './src/images' }));
  }

  @UseGuards(JwtAuthGuard, PostAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard, PostAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res) {
    const post = await this.postsService.findOne(+id);
    const imagesFolderPath = join(process.cwd(), 'src/images');
    const fullImagePath = join(imagesFolderPath + '/' + post.photo);
    removeFile(fullImagePath);
    await this.postsService.remove(+id);
    res.status(200).send({
      message: 'Success delete post',
    });
  }
}
