import { Test, TestingModule } from '@nestjs/testing';
import { ModulesService } from './modules.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateModuleDto } from './dto/update-module.dto';

describe('ModulesService', () => {
  let modulesService: ModulesService;
  let prismaService: jest.Mock<PrismaService>;

  const prismaMock = {
    course: {
      findUnique: jest.fn(),
    },
    module: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    purchase: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModulesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    modulesService = module.get<ModulesService>(ModulesService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(modulesService).toBeDefined();
  });

  describe('Create module', () => {
    const courseId = 1;

    const dto = {
      title: 'Modulo 1',
      description: 'Description Module 1',
    };

    it('should throw notFoundException if course does not exist', async () => {
      prismaMock.course.findUnique.mockResolvedValue(null);

      await expect(modulesService.create(courseId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create module with position 1 if no modules exist', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
      });
      prismaMock.module.findFirst.mockResolvedValue(null);

      const mockCreateCourse = {
        id: 10,
        title: dto.title,
        position: 1,
        courseId,
      };

      prismaMock.module.create.mockResolvedValue(mockCreateCourse);

      const result = await modulesService.create(courseId, dto);

      expect(prismaMock.module.create).toHaveBeenCalledWith({
        data: {
          title: mockCreateCourse.title,
          position: 1,
          courseId,
        },
      });

      expect(result).toEqual({
        message: 'Módulo criado com sucesso',
        newModule: mockCreateCourse,
      });
    });

    it('should create module adding position', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
      });

      const mockFindFirst = {
        id: 1,
        title: dto.title,
        position: 1,
        courseId,
      };

      prismaMock.module.findFirst.mockResolvedValue(mockFindFirst);

      const mockCreateCourse = {
        id: 2,
        title: 'Second module',
        courseId,
      };

      prismaMock.module.create.mockResolvedValue(mockCreateCourse);

      const result = await modulesService.create(courseId, mockCreateCourse);

      expect(prismaMock.module.create).toHaveBeenCalledWith({
        data: {
          title: mockCreateCourse.title,
          position: 2,
          courseId,
        },
      });

      expect(result).toEqual({
        message: 'Módulo criado com sucesso',
        newModule: mockCreateCourse,
      });
    });
  });

  describe('ListTeacherModules', () => {
    const courseId = 1;
    const teacherId = 10;

    it('should throw notFoundException if course does not exist', async () => {
      prismaMock.course.findUnique.mockResolvedValue(null);

      await expect(
        modulesService.listTeacherModules(courseId, teacherId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw unauthorizedException if teacher is not the owner', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: 1,
        teacherId: 10,
      });

      await expect(
        modulesService.listTeacherModules(courseId, 99),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return modules details', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        courseId: 1,
        teacherId: 10,
      });

      const mockResponse = [
        {
          id: 1,
          title: 'module1',
          description: 'description module1',
          position: 1,
          lessons: [
            { id: '1', title: 'lesson1' },
            { id: '2', title: 'lesson2' },
          ],
        },
        {
          id: 2,
          title: 'module2',
          description: 'description module2',
          position: 2,
          lessons: [
            { id: '1', title: 'lesson1' },
            { id: '2', title: 'lesson2' },
          ],
        },
      ];

      prismaMock.module.findMany.mockResolvedValue(mockResponse);

      const result = await modulesService.listTeacherModules(
        courseId,
        teacherId,
      );

      expect(prismaMock.module.findMany).toHaveBeenCalledWith({
        where: { courseId },
        include: {
          lessons: true,
        },
        orderBy: {
          position: 'asc',
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('ListOneTeacher modules', () => {
    const courseId = 1;
    const moduleId = 1;
    const teacherId = 10;

    it('should throw NotFoundException if course does not exist', async () => {
      prismaMock.course.findUnique.mockResolvedValue(null);

      await expect(
        modulesService.listOneTeacher(courseId, moduleId, teacherId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if the teacher is not the owner', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: 1,
        teacherId: 20,
      });

      await expect(
        modulesService.listOneTeacher(courseId, moduleId, teacherId),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if module does not exist', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
        teacherId: 10,
      });

      prismaMock.module.findFirst.mockResolvedValue(null);

      await expect(
        modulesService.listOneTeacher(courseId, moduleId, teacherId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return module detail', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
        teacherId: 10,
      });

      const mockModule = {
        id: 1,
        courseId: 1,
        course: {
          id: 1,
          title: 'course 1',
          status: 'DRAFT',
          teacher: { name: 'teacher1' },
        },
        lessons: [
          {
            id: 1,
            title: 'lesson 1',
            position: 1,
          },
          {
            id: 2,
            title: 'lesson 2',
            position: 2,
          },
        ],
      };

      prismaMock.module.findFirst.mockResolvedValue(mockModule);

      const result = await modulesService.listOneTeacher(
        courseId,
        moduleId,
        teacherId,
      );

      expect(prismaMock.module.findFirst).toHaveBeenCalledWith({
        where: {
          id: moduleId,
          courseId,
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              status: true,
              teacher: {
                select: {
                  name: true,
                },
              },
            },
          },
          lessons: {
            select: {
              id: true,
              title: true,
              position: true,
            },
          },
        },
        orderBy: { position: 'asc' },
      });
      expect(result).toEqual(mockModule);
    });
  });

  describe('ListAll modules', () => {
    const courseId = 1;
    const studentId = 5;

    it('should throw UnauthorizedException if course is DRAFT', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
        status: 'DRAFT',
      });

      await expect(modulesService.listAll(courseId, studentId)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if student has not purchased', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: 1,
        status: 'PUBLISHED',
      });

      prismaMock.purchase.findUnique.mockResolvedValue(null);

      await expect(modulesService.listAll(courseId, studentId)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return paginated modules', async () => {
      const page = 1;
      const limit = 10;
      const total = 10;

      const mockModules = [
        { id: 1, title: 'module 1' },
        { id: 2, title: 'module 2' },
      ];

      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
        status: 'PUBLISHED',
      });

      prismaMock.purchase.findUnique.mockResolvedValue({
        id: 1,
      });

      prismaMock.$transaction.mockResolvedValue([total, mockModules]);

      const result = await modulesService.listAll(courseId, studentId);

      expect(prismaMock.$transaction).toHaveBeenCalled();

      expect(result).toEqual({
        page,
        limit,
        total,
        totalPages: 1,
        data: mockModules,
      });
    });

    it('should calculate skip correctly for page 2', async () => {
      const mockModules = [
        { id: 1, title: 'module 1' },
        { id: 2, title: 'module 2' },
      ];

      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
        status: 'PUBLISHED',
      });

      prismaMock.purchase.findUnique.mockResolvedValue({
        id: 1,
      });

      prismaMock.module.count.mockResolvedValue(20);
      prismaMock.module.findMany.mockResolvedValue(mockModules);

      prismaMock.$transaction.mockImplementation(async (queries) => {
        return [20, mockModules];
      });

      await modulesService.listAll(courseId, studentId, 2, 10);

      expect(prismaMock.module.findMany).toHaveBeenCalledWith({
        where: { courseId },
        skip: 10,
        take: 10,
        include: {
          lessons: true,
        },
        orderBy: { position: 'asc' },
      });
    });
  });

  describe('ListOne modules', () => {
    const courseId = 1;
    const moduleId = 1;
    const studentId = 1;

    it('should throw NotFoundException if course does not exist', async () => {
      prismaMock.course.findUnique.mockResolvedValue(null);

      await expect(
        modulesService.listOne(courseId, moduleId, studentId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if course.status its draft', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
        status: 'DRAFT',
      });

      await expect(
        modulesService.listOne(courseId, moduleId, studentId),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if student has not purchased', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
        status: 'PUBLISHED',
      });

      prismaMock.purchase.findUnique.mockResolvedValue(null);

      await expect(
        modulesService.listOne(courseId, moduleId, studentId),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if module does not exist', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
        status: 'PUBLISH',
      });

      prismaMock.purchase.findUnique.mockResolvedValue({
        id: 1,
      });

      prismaMock.module.findUnique.mockResolvedValue(null);

      await expect(
        modulesService.listOne(courseId, moduleId, studentId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if module does not belong to course', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
        status: 'PUBLISHED',
      });

      prismaMock.purchase.findUnique.mockResolvedValue({
        id: 1,
      });

      prismaMock.module.findUnique.mockResolvedValue({
        id: moduleId,
        courseId: 2,
      });

      await expect(
        modulesService.listOne(courseId, moduleId, studentId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return module detail', async () => {
      const mockModule = {
        id: moduleId,
        courseId: courseId,
      } as any;

      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
        status: 'PUBLISHED',
      });

      prismaMock.purchase.findUnique.mockResolvedValue({
        id: 1,
      });

      prismaMock.module.findUnique.mockResolvedValue({
        id: moduleId,
        courseId,
      });

      const result = await modulesService.listOne(
        courseId,
        moduleId,
        studentId,
      );

      expect(result).toEqual(mockModule);
    });
  });

  describe('Delete modules', () => {
    const courseId = 1;
    const moduleId = 1;
    const teacherId = 1;

    it('should delete module successfully', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
      });

      prismaMock.module.findUnique.mockResolvedValue({
        id: moduleId,
        courseId,
        course: {
          teacherId,
        },
      });

      const mockResponse = {
        message: 'Modulo deletado.',
      };

      prismaMock.module.delete.mockResolvedValue(mockResponse);

      const result = await modulesService.delete(courseId, moduleId, teacherId);

      expect(prismaMock.module.delete).toHaveBeenCalledWith({
        where: {
          id: moduleId,
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Update modules', () => {
    const courseId = 1;
    const moduleId = 1;
    const teacherId = 1;

    const updateMockDto: UpdateModuleDto = {
      title: 'update title',
    };

    it('should update module successfully', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: courseId,
      });

      prismaMock.module.findUnique.mockResolvedValue({
        id: moduleId,
        title: 'old title',
        courseId,
        course: {
          teacherId,
        },
      });

      const updatedModuleMock = {
        id: moduleId,
        title: 'update title',
        courseId,
        course: {
          teacherId,
        },
      };

      prismaMock.module.update.mockResolvedValue(updatedModuleMock);

      const result = await modulesService.update(
        courseId,
        moduleId,
        teacherId,
        updateMockDto,
      );

      expect(prismaMock.module.update).toHaveBeenCalledWith({
        where: {
          id: moduleId,
        },
        data: {
          title: updateMockDto.title,
        },
        include: {
          course: true,
        },
      });

      expect(result).toEqual({
        message: 'Modulo atualizado',
        updatedModule: updatedModuleMock,
      });
    });
  });
});
