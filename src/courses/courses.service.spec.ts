import { CoursesService } from './courses.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('CoursesService', () => {
  let courseService: CoursesService;

  const prismaMock = {
    course: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    courseService = new CoursesService(prismaMock as any);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(courseService).toBeDefined();
  });

  describe('Delete course', () => {
    it('should throw NotFoundException if course does not exists', async () => {
      prismaMock.course.findUnique.mockResolvedValue(null);

      await expect(courseService.delete(1, 10)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if teacher does not the owner', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: 1,
        teacherId: 99,
      });

      await expect(courseService.delete(1, 10)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(prismaMock.course.delete).not.toHaveBeenCalled();
    });

    it('should successfully delete the course', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: 1,
        teacherId: 10,
      });

      const result = await courseService.delete(1, 10);

      expect(prismaMock.course.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(result).toEqual({
        message: 'Curso deletado com sucesso',
      });
    });
  });

  describe('Create course', () => {
    const dto = {
      title: 'NestJS',
      description: 'Curso de Nest',
      imageUrl: 'img.png',
      price: 100,
    };

    const createdCourse = {
      id: 1,
      ...dto,
      teacherId: 10,
    };

    prismaMock.course.create.mockResolvedValue(createdCourse);

    it('should create course with success', async () => {
      const result = await courseService.create(dto, 10);

      expect(prismaMock.course.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          imageUrl: dto.imageUrl,
          price: dto.price,
          teacherId: 10,
        },
      });

      expect(result).toEqual({
        message: 'Curso criado com sucesso.',
        newCourse: createdCourse,
      });
    });
  });

  describe('Update course', () => {
    it("should throw NotFoundException if course doesn't exists", async () => {
      prismaMock.course.findUnique.mockResolvedValue(null);

      await expect(
        courseService.update(1, { title: 'teste' }, 10),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw UnauthorizedException if user doesn't the owner", async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: 1,
        teacherId: 10,
      });

      await expect(
        courseService.update(1, { title: 'teste' }, 99),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaMock.course.update).not.toHaveBeenCalled();
    });

    const dto = {
      title: 'teste update',
    };

    const updatedDto = {
      id: 1,
      ...dto,
      teacherId: 10,
    };

    it('should update course successfully', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: 1,
        teacherId: 10,
      });

      prismaMock.course.update.mockResolvedValue(updatedDto);

      const result = await courseService.update(1, dto, 10);

      expect(prismaMock.course.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });

      expect(result).toEqual({
        message: 'Curso atualizado com sucesso',
        updatedCourse: updatedDto,
      });
    });
  });

  describe('List all courses', () => {
    it('should return paginated courses', async () => {
      const page = 1;
      const limit = 10;

      const total = 10;

      const courses = [
        { id: 6, title: 'Curso 6' },
        { id: 7, title: 'Curso 7' },
      ];

      prismaMock.$transaction.mockResolvedValue([total, courses]);

      const result = await courseService.listAll(page, limit);

      expect(prismaMock.$transaction).toHaveBeenCalled();

      expect(result).toEqual({
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
        data: courses,
      });
    });

    it('should use default value "page = 1" and  "limit = 10" ', async () => {
      const total = 10;
      const course = [
        { id: 6, title: 'Curso 6' },
        { id: 7, title: 'Curso 7' },
      ];

      prismaMock.$transaction.mockResolvedValue([total, course]);

      const result = await courseService.listAll();

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('List one course', () => {
    const mockCourse = {
      id: 1,
      teacher: {
        id: 10,
        name: 'teacher1',
      },
      module: [
        {
          id: 1,
          title: 'Module1',
          position: 1,
        },
        {
          id: 2,
          title: 'Module2',
          position: 2,
        },
      ],
    };

    it('should throw NotFoundException if course not found', async () => {
      prismaMock.course.findUnique.mockResolvedValue(null);

      await expect(courseService.listOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should return course details', async () => {
      prismaMock.course.findUnique.mockResolvedValue(mockCourse);

      const result = await courseService.listOne(1);

      expect(result).toEqual(mockCourse);

      expect(prismaMock.course.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        include: {
          teacher: {
            select: { id: true, name: true },
          },
          modules: {
            select: { id: true, title: true, position: true },
          },
        },
      });
    });
  });

  describe('Get Public Course', () => {
    const mock = {
      id: 1,
      title: 'title',
      description: 'description',
      imageUrl: 'https://image.com',
      price: 100,
      status: 'PUBLISHED',
      teacher: {
        name: 'teacher1',
      },
      modules: [
        {
          id: 1,
          lessons: [{ duration: 10 }],
        },
        {
          id: 2,
          lessons: [{ duration: 20 }],
        },
      ],
    };

    it('should return public course details', async () => {
      prismaMock.course.findUnique.mockResolvedValue(mock);

      const result = await courseService.getPublicCourse(1);

      expect(result).toEqual({
        id: 1,
        title: 'title',
        description: 'description',
        imageUrl: 'https://image.com',
        price: 100,
        teacher: { name: 'teacher1' },
        stats: {
          modules: 2,
          lessons: 2,
          duration: 30,
        },
      });

      expect(prismaMock.course.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          teacher: {
            select: { name: true },
          },
          modules: {
            select: {
              id: true,
              lessons: {
                select: { duration: true },
              },
            },
          },
        },
      });
    });

    it('should throw NotFoundException if course does not exist', async () => {
      prismaMock.course.findUnique.mockResolvedValue(null);

      await expect(courseService.getPublicCourse(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if course does not exist', async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        ...mock,
        status: 'DRAFT',
      });

      await expect(courseService.getPublicCourse(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Publish course', () => {
    it('should throw NotFoundException if course does not exist', async () => {
      prismaMock.course.findUnique.mockResolvedValue(null);

      await expect(courseService.publish(1, 10)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw UnauthorizedException if user doesn't the owner", async () => {
      prismaMock.course.findUnique.mockResolvedValue({
        id: 1,
        teacherId: 10,
      });

      await expect(courseService.publish(1, 99)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if status different to 'DRAFT' ", async () => {
      const mock = {
        id: 1,
        status: 'PUBLISHED',
        teacherId: 10,
        modules: [{ id: 1 }, { id: 2 }],
      };

      prismaMock.course.findUnique.mockResolvedValue(mock);

      await expect(courseService.publish(1, 10)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if modules length equal to zero ', async () => {
      const mock = {
        id: 1,
        status: 'DRAFT',
        teacherId: 10,
        modules: [],
      };

      prismaMock.course.findUnique.mockResolvedValue(mock);

      await expect(courseService.publish(1, 10)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should publish course successfully', async () => {
      const mock = {
        id: 1,
        status: 'DRAFT',
        teacherId: 10,
        modules: [{ id: 1 }, { id: 2 }],
      };

      const mockUpdate = {
        id: 1,
        status: 'PUBLISHED',
      };

      prismaMock.course.findUnique.mockResolvedValue(mock);
      prismaMock.course.update.mockResolvedValue(mockUpdate);

      const result = await courseService.publish(1, 10);

      expect(prismaMock.course.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          modules: true,
        },
      });

      expect(result).toEqual({
        message: 'Curso publicado com sucesso',
        updatedCourse: mockUpdate,
      });
    });
  });

  describe('ListByTeacher', () => {
    it('should return paginated courses', async () => {
      const page = 1;
      const limit = 10;

      const total = 10;

      const courses = [
        { id: 6, title: 'Curso 6', teacherId: 10 },
        { id: 7, title: 'Curso 7', teacherId: 10 },
      ];

      prismaMock.$transaction.mockResolvedValue([total, courses]);

      const result = await courseService.listByTeacher(10, page, limit);

      expect(prismaMock.$transaction).toHaveBeenCalled();

      expect(result).toEqual({
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
        data: courses,
      });
    });
  });
});
