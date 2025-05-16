import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { AdminNewsModel } from '~/admin-news/model/admin-news-model';
import { News } from '~/entity/news.entity';

@Injectable()
export class NewsDao {
  constructor(
    @InjectRepository(News) private newsRepository: Repository<News>,
  ) {}

  public async create(model: AdminNewsModel, imagePath: string): Promise<News> {
    return await this.newsRepository.create({ ...model, imagePath });
  }

  public async save(news: News): Promise<News> {
    return await this.newsRepository.save(news);
  }

  public async delete(id: string): Promise<DeleteResult> {
    return await this.newsRepository.delete({ id });
  }

  public async findAll(): Promise<News[]> {
    return await this.newsRepository.find({
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  public async findOneById(id: string): Promise<News> {
    return await this.newsRepository.findOneBy({
      id: id,
    });
  }
}
