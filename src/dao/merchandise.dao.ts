import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, Like, Repository } from 'typeorm';
import { CustomMerchandiseDetailEntity } from '~/entity/custom/custom-merchandise-detail.entity';
import { Merchandise } from '~/entity/merchandise.entity';
import { MerchandiseSearchModel } from '../admin-merchandise/model/admin-search-merchandise-request.model';

@Injectable()
export class MerchandiseDao {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Merchandise)
    private merchandiseRepository: Repository<Merchandise>,
  ) {}

  public async queryMerchandise(
    params: MerchandiseSearchModel,
  ): Promise<CustomMerchandiseDetailEntity[]> {
    const query = this.entityManager
      .createQueryBuilder()
      .select(
        ` member.*,
          merchandise.*
        `,
      )
      .from('merchandise', 'merchandise')
      .innerJoin('member', 'member', 'merchandise.member_id = member.id');
    if (params.email) {
      query.andWhere('member.email like :email', {
        email: `%${params.email}%`,
      });
    }
    if (params.profileName) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('member.last_name like :profileName', {
            profileName: `%${params.profileName}%`,
          }).orWhere('member.first_name like :profileName', {
            profileName: `%${params.profileName}%`,
          });
        }),
      );
    }
    if (params.userName) {
      query.andWhere('member.user_name like :userName', {
        userName: `%${params.userName}%`,
      });
    }
    query.orderBy('merchandise.created_at', 'DESC');
    const results = await query.getRawMany();
    return CustomMerchandiseDetailEntity.toResponses(results);
  }

  public async getMerchandise(id: string): Promise<Merchandise> {
    return this.merchandiseRepository.findOne({
      where: { id },
    });
  }

  public async save(merchandise: Merchandise): Promise<Merchandise> {
    return await this.merchandiseRepository.save(merchandise);
  }

  public async delete(id: string): Promise<void> {
    await this.merchandiseRepository.delete({ id });
  }

  public async findMerchandiseToMint(): Promise<Merchandise[]> {
    const merchandises = await this.merchandiseRepository.find({
      where: {
        mintId: Like('dmint-%'),
      },
    });

    return merchandises;
  }
}
