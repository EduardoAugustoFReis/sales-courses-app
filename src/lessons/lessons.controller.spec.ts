import { Test, TestingModule } from '@nestjs/testing';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { RequestUserDto } from 'src/common/dto/request-user.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

describe('LessonsController', () => {
  let controller: LessonsController;
  let lessonsService: LessonsService;

  const mockLessonsServices = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [
        {
          provide: LessonsService,
          useValue: mockLessonsServices,
        },
      ],
    }).compile();

    controller = module.get<LessonsController>(LessonsController);
    lessonsService = module.get<LessonsService>(LessonsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create lesson', () => {
    const courseId = 1;
    const moduleId = 1;
    const lessonId = 1;
    const mockUser = {
      sub: 1,
    } as RequestUserDto;

    const dto: CreateLessonDto = {
      title: 'teste',
      duration: 10,
      videoUrl: 'https://video.com',
    };

    it('should call service.create with corrects params', async () => {
      const mockReturn = {
        moduleId,
        title: 'teste',
        duration: 10,
        videoUrl: 'https://video.com',
        position: 1,
        id: lessonId,
      };

      mockLessonsServices.create.mockResolvedValue(mockReturn);

      const result = await controller.create(courseId, moduleId, dto, mockUser);

      expect(mockLessonsServices.create).toHaveBeenCalledWith({
        courseId,
        moduleId,
        teacherId: mockUser.sub,
        dto,
      });

      expect(result).toEqual(mockReturn);
    });
  });

  describe('Update lesson', () => {
    const courseId = 1;
    const moduleId = 1;
    const lessonId = 1;
    const mockUser = {
      sub: 1,
    } as RequestUserDto;

    const dto: UpdateLessonDto = {
      title: 'teste',
      duration: 10,
      videoUrl: 'https://video.com',
    };

    const updated = {
      title: 'teste',
      duration: 10,
      videoUrl: 'https://video.com',
      position: 1,
      id: lessonId,
      moduleId,
    };

    it('should call service.update with corrects params', async () => {
      const mockResponse = {
        message: 'Aula atualizada com sucesso',
        data: updated,
      };

      mockLessonsServices.update.mockResolvedValue(mockResponse);

      const result = await controller.update(
        courseId,
        moduleId,
        lessonId,
        dto,
        mockUser,
      );

      expect(mockLessonsServices.update).toHaveBeenCalledWith({
        courseId,
        moduleId,
        lessonId,
        teacherId: mockUser.sub,
        dto,
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Remove lesson', () => {
    const courseId = 1;
    const moduleId = 1;
    const lessonId = 1;
    const mockUser = {
      sub: 1,
    } as RequestUserDto;

    it('should call service.remove with corrects params', async () => {
      const mockResponse = {
        message: 'Aula deletada com sucesso',
      };

      mockLessonsServices.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(
        courseId,
        moduleId,
        lessonId,
        mockUser,
      );

      expect(mockLessonsServices.remove).toHaveBeenCalledWith({
        courseId,
        moduleId,
        lessonId,
        teacherId: mockUser.sub,
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('ListAll lesson', () => {
    const courseId = 1;
    const moduleId = 1;
    const mockUser = {
      sub: 1,
    } as RequestUserDto;

    const page = 1;
    const limit = 10;
    const total = 1;

    it('should call service.listAll with corrects params', async () => {
      const lessons = [
        { id: 1, title: 'teste 1', position: 1 },
        { id: 2, title: 'teste 2', position: 2 },
      ];

      const mockResponse = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: lessons,
      };

      mockLessonsServices.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(
        courseId,
        moduleId,
        mockUser,
        page,
        limit,
      );

      expect(mockLessonsServices.findAll).toHaveBeenCalledWith({
        courseId,
        moduleId,
        userId: mockUser.sub,
        page,
        limit,
      });

      expect(result).toEqual(mockResponse);
    });

    it('should call service.listAll without page and limit', async () => {
      const lessons = [
        { id: 1, title: 'teste 1', position: 1 },
        { id: 2, title: 'teste 2', position: 2 },
      ];

      const mockResponse = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: lessons,
      };

      mockLessonsServices.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(courseId, moduleId, mockUser);

      expect(mockLessonsServices.findAll).toHaveBeenCalledWith({
        courseId,
        moduleId,
        userId: mockUser.sub,
        page,
        limit,
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('ListOne lesson', () => {
    const courseId = 1;
    const moduleId = 1;
    const lessonId = 1;
    const mockUser = {
      sub: 1,
    } as RequestUserDto;

    it('should call service.listOne with corrects params', async () => {
      const mockResponse = {
        title: 'teste',
        videoUrl: 'https://video.com',
        duration: 10,
        position: 1,
        id: lessonId,
        moduleId,
      };

      mockLessonsServices.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(
        courseId,
        moduleId,
        lessonId,
        mockUser,
      );

      expect(mockLessonsServices.findOne).toHaveBeenCalledWith({
        courseId,
        moduleId,
        lessonId,
        userId: mockUser.sub,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
