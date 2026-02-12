import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { RequestUserDto } from 'src/common/dto/request-user.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateCourseDto } from './dto/update-course.dto';

describe('CoursesController', () => {
  let coursesController: CoursesController;
  let coursesService: CoursesService;

  const mockCourseService = {
    create: jest.fn(),
    listAll: jest.fn(),
    listByTeacher: jest.fn(),
    listOne: jest.fn(),
    getPublicCourse: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    publish: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: mockCourseService,
        },
      ],
    }).compile();

    coursesController = module.get<CoursesController>(CoursesController);
    coursesService = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(coursesController).toBeDefined();
  });

  describe('listAllCourses', () => {
    it('should call service.listAll with correct params and return result', async () => {
      const mockResponse = {
        page: 1,
        limit: 10,
        total: 10,
        totalPage: 1,
        data: [{ id: 1, title: 'teste' }],
      };

      coursesService.listAll.mockResolvedValue(mockResponse);

      const result = await coursesController.listAllCourses(1, 10);

      expect(coursesService.listAll).toHaveBeenCalledWith(1, 10);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('CreateCourse', () => {
    it('should call courseService.create with dto and user.sub and return result', async () => {
      const mockDto: CreateCourseDto = {
        title: 'teste create',
        price: 100,
        description: 'description',
        imageUrl: 'https://image.com',
      };

      const mockUser = {
        sub: 1,
      } as RequestUserDto;

      const mockResponse = {
        message: 'Curso criado com sucesso.',
        newCourse: {
          id: 1,
          ...mockDto,
          teacherId: 1,
        },
      };

      coursesService.create.mockResolvedValue(mockResponse);

      const result = await coursesController.createCourse(mockDto, mockUser);

      expect(coursesService.create).toHaveBeenCalledWith(mockDto, 1);
      expect(coursesService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('ListByTeacher', () => {
    it('should call service.listByTeacher with user.sub, page and limit', async () => {
      const mockUser = {
        sub: 1,
      } as RequestUserDto;

      const mockResponse = {
        page: 1,
        limit: 10,
        total: 1,
        totalPage: 1,
        data: [],
      };

      coursesService.listByTeacher.mockResolvedValue(mockResponse);

      const result = await coursesController.listMyCourses(mockUser, 1, 10);

      expect(coursesService.listByTeacher).toHaveBeenCalledWith(1, 1, 10);
      expect(coursesService.listByTeacher).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it('should call service.listByTeacher with default values, page and limit', async () => {
      const mockUser = {
        sub: 1,
      } as RequestUserDto;

      const responseMock = {
        page: 1,
        limit: 10,
        total: 10,
        totalPage: 1,
        data: [],
      };

      coursesService.listByTeacher.mockResolvedValue(responseMock);

      const result = await coursesController.listMyCourses(mockUser);

      expect(coursesService.listByTeacher).toHaveBeenCalledWith(1, 1, 10);
      expect(coursesService.listByTeacher).toHaveBeenCalledTimes(1);
      expect(result).toEqual(responseMock);
    });
  });

  describe('getPublicCourse', () => {
    const courseId = 1;

    it('should call service.getPublicCourse with id and return result', async () => {
      const mockResponse = {
        id: 1,
        title: 'teste',
        description: 'description',
        imageUrl: 'https://image.com',
        price: 100,
        teacher: { name: 'teacher1' },
        stats: {
          modules: 1,
          lessons: 1,
          duration: 30,
        },
      };

      coursesService.getPublicCourse.mockResolvedValue(mockResponse);

      const result = await coursesController.getPublicCourse(courseId);

      expect(coursesService.getPublicCourse).toHaveBeenCalledWith(courseId);
      expect(coursesService.getPublicCourse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it('should throw when service throws NotFoundException', async () => {
      coursesService.getPublicCourse.mockRejectedValue(
        new NotFoundException('Curso não encontrado'),
      );

      await expect(coursesController.getPublicCourse(courseId)).rejects.toThrow(
        NotFoundException,
      );

      expect(coursesService.getPublicCourse).toHaveBeenCalledWith(courseId);
    });
  });

  describe('Delete Course', () => {
    const courseId = 1;
    const mockUser = {
      sub: 1,
    } as RequestUserDto;

    it('should call service.delete with id and user.sub and return result', async () => {
      const mockResponse = {
        message: 'Curso deletado com sucesso',
      };

      coursesService.delete.mockResolvedValue(mockResponse);

      const result = await coursesController.deleteCourses(courseId, mockUser);

      expect(coursesService.delete).toHaveBeenCalledWith(1, 1);
      expect(coursesService.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it('should throw NotFoundException when service throws', async () => {
      coursesService.delete.mockRejectedValue(
        new NotFoundException('Curso não encontrado'),
      );

      await expect(
        coursesController.deleteCourses(courseId, mockUser),
      ).rejects.toThrow(NotFoundException);
      expect(coursesService.delete).toHaveBeenCalledWith(1, 1);
    });

    it('should throw UnauthorizedException when service throws', async () => {
      coursesService.delete.mockRejectedValue(
        new UnauthorizedException('Você não pode deletar esse curso.'),
      );

      await expect(
        coursesController.deleteCourses(10, mockUser),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Update Course', () => {
    const courseId = 1;

    const mockUser = {
      sub: 1,
    } as RequestUserDto;

    const dto: UpdateCourseDto = {
      title: 'teste',
      price: 100,
    };

    const mockResponse = {
      message: 'Curso atualizado com sucesso',
      updatedCourse: dto,
    };

    it('should call service.update with id, dto and user.sub', async () => {
      coursesService.update.mockResolvedValue(mockResponse);

      const result = await coursesController.updateCourse(
        courseId,
        dto,
        mockUser,
      );

      expect(coursesService.update).toHaveBeenCalledWith(1, dto, 1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Publish Course', () => {
    const courseId = 1;

    const mockUser = {
      sub: 1,
    } as RequestUserDto;

    const mockResponse = {
      message: 'Curso publicado com sucesso',
      updatedCourse: {
        id: courseId,
        status: 'PUBLISHED',
      },
    };

    it('should call service.publish with id and user.sub', async () => {
      coursesService.publish.mockResolvedValue(mockResponse);

      const result = await coursesController.publishCourse(courseId, mockUser);

      expect(coursesService.publish).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(mockResponse);
    });
    
  });
});
