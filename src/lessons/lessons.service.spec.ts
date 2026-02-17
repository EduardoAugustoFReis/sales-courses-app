import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from './lessons.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateLessonDto } from './dto/update-lesson.dto';

describe('LessonsService', () => {
  let lessonsService: LessonsService;
  let prismaService: jest.Mock<PrismaService>;

  const prismaMock = {
    module: {
      findFirst: jest.fn(),
    },
    lesson: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    lessonsService = module.get<LessonsService>(LessonsService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(lessonsService).toBeDefined();
  });

  describe('Create lesson', () => {
    const courseId = 1;
    const moduleId = 1;
    const teacherId = 10;

    const dto: CreateLessonDto = {
      title: 'teste',
      duration: 10,
      videoUrl: 'https://video.com',
    };

    it('should throw notFoundException if module does not exist', async () => {
      prismaMock.module.findFirst.mockResolvedValue(null);

      await expect(
        lessonsService.create({
          courseId,
          moduleId,
          teacherId,
          dto,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if teacher is not the owner', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId: 999,
          status: 'PUBLISHED',
          purchases: [],
        },
      });

      await expect(
        lessonsService.create({
          courseId,
          moduleId,
          teacherId,
          dto,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create lesson successfully', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId,
          status: 'DRAFT',
          purchase: [],
        },
      });

      prismaMock.lesson.findFirst.mockResolvedValue({
        position: 1,
      });

      const createdLessonMock = {
        id: 2,
        ...dto,
        position: 2,
        moduleId,
      };

      prismaMock.lesson.create.mockResolvedValue(createdLessonMock);

      const result = await lessonsService.create({
        courseId,
        moduleId,
        teacherId,
        dto,
      });

      expect(prismaMock.lesson.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          videoUrl: dto.videoUrl,
          duration: dto.duration,
          position: 2,
          moduleId,
        },
      });

      expect(result).toEqual(createdLessonMock);
    });

    it('should start position at 1 if no previous lessons exist', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId,
          status: 'PUBLISHED',
          purchases: [],
        },
      });

      prismaMock.lesson.findFirst.mockResolvedValue(null);

      const createdLesson = {
        id: 1,
        ...dto,
        position: 1,
        moduleId,
      };

      prismaMock.lesson.create.mockResolvedValue(createdLesson);

      const result = await lessonsService.create({
        courseId,
        moduleId,
        teacherId,
        dto,
      });

      expect(prismaMock.lesson.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          videoUrl: dto.videoUrl,
          duration: dto.duration,
          position: 1,
          moduleId,
        },
      });

      expect(result).toBe(createdLesson);
    });
  });

  describe('ListAll lessons', () => {
    const courseId = 1;
    const userId = 5;
    const teacherId = 10;
    const moduleId = 1;
    const page = 1;
    const limit = 10;
    const total = 1;

    it('should return paginated lessons', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId,
          status: 'PUBLISHED',
          purchases: [
            {
              studentId: userId,
              status: 'PAID',
            },
          ],
        },
      });

      const lessons = [
        { id: 1, title: 'lesson 1', position: 1 },
        { id: 2, title: 'lesson 2', position: 2 },
      ];

      prismaMock.$transaction.mockResolvedValue([1, lessons]);

      const result = await lessonsService.findAll({
        courseId,
        moduleId,
        page,
        limit,
        userId,
      });

      expect(prismaMock.lesson.count).toHaveBeenCalledWith({
        where: { moduleId },
      });

      expect(prismaMock.lesson.findMany).toHaveBeenCalledWith({
        where: { moduleId },
        orderBy: { position: 'asc' },
        skip: 0,
        take: limit,
      });

      expect(result).toEqual({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: lessons,
      });
    });

    it('should return paginated lessons without default values', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId,
          status: 'PUBLISHED',
          purchases: [
            {
              studentId: userId,
              status: 'PAID',
            },
          ],
        },
      });

      const lessons = [
        { id: 1, title: 'lesson 1', position: 1 },
        { id: 2, title: 'lesson 2', position: 2 },
      ];

      prismaMock.$transaction.mockResolvedValue([1, lessons]);

      const result = await lessonsService.findAll({
        courseId,
        moduleId,
        userId,
      });

      expect(prismaMock.lesson.count).toHaveBeenCalledWith({
        where: { moduleId },
      });

      expect(prismaMock.lesson.findMany).toHaveBeenCalledWith({
        where: { moduleId },
        orderBy: { position: 'asc' },
        skip: 0,
        take: limit,
      });

      expect(result).toEqual({
        page: 1,
        limit: 10,
        total,
        totalPages: Math.ceil(total / limit),
        data: lessons,
      });
    });
  });

  describe('Update lessons', () => {
    const courseId = 1;
    const moduleId = 1;
    const lessonId = 1;
    const teacherId = 10;

    const dto: UpdateLessonDto = {
      title: 'teste',
      duration: 10,
      videoUrl: 'https://video.com',
    };

    it('should throw notFoundException if module does not exist', async () => {
      prismaMock.module.findFirst.mockResolvedValue(null);

      await expect(
        lessonsService.update({ courseId, moduleId, lessonId, teacherId, dto }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if teacher is not the owner', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId: 999,
          status: 'PUBLISHED',
          purchases: [],
        },
      });

      await expect(
        lessonsService.update({ courseId, moduleId, lessonId, teacherId, dto }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw notFoundException if lesson does not exist', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId,
          status: 'PUBLISHED',
          purchases: [],
        },
      });

      prismaMock.lesson.findFirst.mockResolvedValue(null);

      await expect(
        lessonsService.update({ courseId, moduleId, lessonId, teacherId, dto }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update lesson successfully', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId,
          status: 'PUBLISHED',
          purchases: [],
        },
      });

      prismaMock.lesson.findFirst.mockResolvedValue({
        id: lessonId,
        moduleId,
      });

      const updatedLessonMock = {
        id: lessonId,
        title: 'teste',
        duration: 10,
        videoUrl: 'https://video.com',
      };

      prismaMock.lesson.update.mockResolvedValue(updatedLessonMock);

      const result = await lessonsService.update({
        courseId,
        moduleId,
        lessonId,
        teacherId,
        dto,
      });

      expect(prismaMock.lesson.update).toHaveBeenCalledWith({
        where: { id: lessonId },
        data: dto,
      });
      expect(result).toEqual({
        message: 'Aula atualizada com sucesso',
        data: updatedLessonMock,
      });
    });
  });

  describe('Remove lesson', () => {
    const courseId = 1;
    const moduleId = 1;
    const lessonId = 1;
    const teacherId = 10;

    it('should throw notFoundException if module does not exist', async () => {
      prismaMock.module.findFirst.mockResolvedValue(null);

      await expect(
        lessonsService.remove({ courseId, moduleId, lessonId, teacherId }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if teacher is not the owner', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId: 999,
          status: 'PUBLISHED',
          purchases: [],
        },
      });

      await expect(
        lessonsService.remove({ courseId, moduleId, lessonId, teacherId }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw notFoundException if lesson does not exist', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId,
          status: 'PUBLISHED',
          purchases: [],
        },
      });

      prismaMock.lesson.findFirst.mockResolvedValue(null);

      await expect(
        lessonsService.remove({ courseId, moduleId, lessonId, teacherId }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should remove lesson successfully', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId,
          status: 'PUBLISHED',
          purchases: [],
        },
      });

      prismaMock.lesson.findFirst.mockResolvedValue({
        id: lessonId,
        moduleId,
      });

      prismaMock.lesson.delete.mockResolvedValue({});

      const result = await lessonsService.remove({
        courseId,
        moduleId,
        lessonId,
        teacherId,
      });

      expect(prismaMock.lesson.delete).toHaveBeenCalledWith({
        where: { id: lessonId },
      });

      expect(result).toEqual({
        message: 'Aula deletada com sucesso',
      });
    });
  });

  describe('FindOne lesson', () => {
    const courseId = 1;
    const moduleId = 1;
    const lessonId = 1;
    const teacherId = 10;
    const userId = 1;

    it('should throw notFoundException if module does not exist', async () => {
      prismaMock.module.findFirst.mockResolvedValue(null);

      await expect(
        lessonsService.findOne({ courseId, moduleId, lessonId, userId }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if teacher is not the owner', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId: 999,
          status: 'PUBLISHED',
          purchases: [],
        },
      });

      await expect(
        lessonsService.findOne({ courseId, moduleId, lessonId, userId }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException if course is draft and user is not teacher', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId: 999,
          status: 'DRAFT',
          purchases: [],
        },
      });

      await expect(
        lessonsService.findOne({
          courseId,
          moduleId,
          lessonId,
          userId,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if lesson does not exist', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId: userId,
          status: 'PUBLISHED',
          purchases: [],
        },
      });

      prismaMock.lesson.findFirst.mockResolvedValue(null);

      await expect(
        lessonsService.findOne({
          courseId,
          moduleId,
          lessonId,
          userId,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return lesson if user is teacher', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId: userId,
          status: 'DRAFT',
          purchases: [],
        },
      });

      const lessonMock = {
        id: lessonId,
        title: 'teste',
        moduleId,
      };

      prismaMock.lesson.findFirst.mockResolvedValue(lessonMock);

      const result = await lessonsService.findOne({
        courseId,
        moduleId,
        lessonId,
        userId,
      });

      expect(result).toEqual(lessonMock);
    });

    it('should return lesson if user is student', async () => {
      prismaMock.module.findFirst.mockResolvedValue({
        id: moduleId,
        course: {
          id: courseId,
          teacherId: 999,
          status: 'PUBLISHED',
          purchases: [
            {
              studentId: userId,
              status: 'PAID',
            },
          ],
        },
      });

      const lessonMock = {
        id: lessonId,
        title: 'teste',
        moduleId,
      };

      prismaMock.lesson.findFirst.mockResolvedValue(lessonMock);

      const result = await lessonsService.findOne({
        courseId,
        moduleId,
        lessonId,
        userId,
      });

      expect(result).toEqual(lessonMock);
    });
  });
  
});
