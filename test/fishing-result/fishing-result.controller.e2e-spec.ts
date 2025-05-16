import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { FishType } from '~/constants/fish-type';
import { Member } from '~/entity/member.entity';
import { FishingResultApplyRequestDto } from '~/fishing-result/dto/fishing-result-apply-request-dto';
import { FishingResultController } from '~/fishing-result/fishing-result.controller';
import { FishingResultService } from '~/fishing-result/fishing-result.service';
import { FishingResultAndLureModel } from '~/fishing-result/model/fishing-result-and-lure-model';

const member = new Member({ id: '1' });
const fishingResultAndLureModel = new FishingResultAndLureModel({ id: 'id' });

const requestForApply = new FishingResultApplyRequestDto({
  caughtYearAt: 2023,
  caughtMonthAt: 8,
  caughtDayAt: 8,
  field: '0001',
  size: 30,
  fishType: FishType.LARGEMOUTH_BASS.id,
  lureId: 'lureId',
  rod: '0001',
  reel: '0001',
  line: '0001',
  imageForApply: 'image for apply',
  imageForNft: 'image for nft',
});

describe('FishingResultController', () => {
  let controller: FishingResultController;
  let service: FishingResultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FishingResultController],
      providers: [
        {
          provide: FishingResultService,
          useValue: {
            getByIdAndUserName: jest.fn(),
            register: jest.fn(),
            modify: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get(FishingResultController);
    service = module.get(FishingResultService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('test register', () => {
    it('success', async () => {
      const spy = jest
        .spyOn(service, 'register')
        .mockResolvedValue(Promise.resolve());
      await controller.register({ user: member }, requestForApply);
      expect(spy).toHaveBeenCalledWith({
        ...FishingResultApplyRequestDto.toRegisterModel(
          member.id,
          requestForApply,
        ),
        caughtAt: expect.anything(), // 厳密なチェックをしない
      });
    });

    describe('class-validator', () => {
      it('success', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
        });
        const error = await validate(request);
        expect(error.length).toBe(0);
      });

      it('error caughtYearAt < 2000', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          caughtYearAt: 1999,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.min).toContain('caughtYearAt');
        expect(error[0].constraints.min).toContain('2000');
      });

      it('error caughtYearAt > 3000', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          caughtYearAt: 3001,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.max).toContain('caughtYearAt');
        expect(error[0].constraints.max).toContain('3000');
      });

      it('error caughtMonthAt < 1', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          caughtMonthAt: 0,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.min).toContain('caughtMonthAt');
        expect(error[0].constraints.min).toContain('1');
      });

      it('error caughtMonthAt > 12', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          caughtMonthAt: 13,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.max).toContain('caughtMonthAt');
        expect(error[0].constraints.max).toContain('12');
      });

      it('error caughtDayAt < 1', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          caughtDayAt: 0,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.min).toContain('caughtDayAt');
        expect(error[0].constraints.min).toContain('1');
      });

      it('error caughtDayAt > 31', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          caughtDayAt: 32,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.max).toContain('caughtDayAt');
        expect(error[0].constraints.max).toContain('31');
      });

      it('error field is null', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          field: null,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.matches).toContain('field');
        expect(error[0].constraints.isNotEmpty).toContain('field');
      });

      it('error size < 1', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          size: 0,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.min).toContain('size');
        expect(error[0].constraints.min).toContain('1');
      });

      it('error fishType is null', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          fishType: null,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.isNotEmpty).toContain('fishType');
      });

      it('error fishType is not 1 length', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          fishType: '11',
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.matches).toContain('fishType');
      });

      it('error fishType is not match', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          fishType: 'a',
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.matches).toContain('fishType');
      });

      it('error lureId is null', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          lureId: null,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.isNotEmpty).toContain('lureId');
      });

      it('error rod is null', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          rod: null,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.matches).toContain('rod');
        expect(error[0].constraints.isNotEmpty).toContain('rod');
      });

      it('error rod is not matches', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          rod: '123a',
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.matches).toContain('rod');
      });

      it('error reel is null', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          reel: null,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.matches).toContain('reel');
        expect(error[0].constraints.isNotEmpty).toContain('reel');
      });

      it('error reel is not matches', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          reel: '123a',
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.matches).toContain('reel');
      });

      it('error line is null', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          line: null,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.matches).toContain('line');
        expect(error[0].constraints.isNotEmpty).toContain('line');
      });

      it('error line is not matches', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          line: '123a',
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.matches).toContain('line');
      });

      it('error comment > 64', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          comment:
            '01234567890123456789012345678901234567890123456789012345678901234',
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.maxLength).toContain('comment');
        expect(error[0].constraints.maxLength).toContain('64');
      });

      it('error imageForApply is null', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          imageForApply: null,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.isNotEmpty).toContain('imageForApply');
      });

      it('error imageForNft is null', async () => {
        const request = new FishingResultApplyRequestDto({
          ...requestForApply,
          imageForNft: null,
        });
        const error = await validate(request);
        expect(error.length).toBe(1);
        expect(error[0].constraints.isNotEmpty).toContain('imageForNft');
      });
    });
  });

  describe('test detail', () => {
    it('return a FishingResultAndLureModel', async () => {
      const spy = jest
        .spyOn(service, 'getByIdAndUserName')
        .mockResolvedValue(Promise.resolve(fishingResultAndLureModel));
      const response = await controller.detail('userName', 'fishing-result-id');

      expect(response).toEqual(fishingResultAndLureModel);
      expect(spy).toHaveBeenCalledWith('fishing-result-id', 'userName');
    });

    it('throw NotFoundException', async () => {
      const expected = new NotFoundException('Not foud FishingResult!!!!!');
      const spy = jest
        .spyOn(service, 'getByIdAndUserName')
        .mockImplementation(() => {
          throw expected;
        });

      expect(
        controller.detail('userName', 'fishing-result-id'),
      ).rejects.toStrictEqual(expected);
      expect(spy).toHaveBeenCalledWith('fishing-result-id', 'userName');
    });
  });

  describe('test modify', () => {
    it('success', async () => {
      const spy = jest
        .spyOn(service, 'modify')
        .mockResolvedValue(Promise.resolve());
      await controller.modify(
        { user: member },
        'fishingResultId',
        requestForApply,
      );
      expect(spy).toHaveBeenCalledWith({
        ...FishingResultApplyRequestDto.toModifyModel(
          'fishingResultId',
          member.id,
          requestForApply,
        ),
        caughtAt: expect.anything(), // 厳密なチェックをしない
      });
    });
  });
});
