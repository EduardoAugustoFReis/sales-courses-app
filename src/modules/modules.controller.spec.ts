import { Test, TestingModule } from '@nestjs/testing';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { RequestUserDto } from 'src/common/dto/request-user.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

describe('ModulesController', () => {
  let modulesController: ModulesController;

  const mockModuleService = {
    create: jest.fn(),
    listTeacherModules: jest.fn(),
    listOneTeacher: jest.fn(),
    listAll: jest.fn(),
    listOne: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModulesController],
      providers: [
        {
          provide: ModulesService,
          useValue: mockModuleService,
        },
      ],
    }).compile();

    modulesController = module.get<ModulesController>(ModulesController);
  });

  it('should be defined', () => {
    expect(modulesController).toBeDefined();
  });

  describe('Create module', () => {
    const courseId = 1;

    it('should call service.create with correct params', async () => {
      const mockDto: CreateModuleDto = {
        title: 'titulo teste',
      };

      const newModuleMock = {
        id: 1,
        title: 'titulo',
        position: 1,
        courseId,
      };

      const mockResponse = {
        message: 'Módulo criado com sucesso',
        newModule: newModuleMock,
      };

      mockModuleService.create.mockResolvedValue(mockResponse);

      const result = await modulesController.createModule(courseId, mockDto);

      expect(mockModuleService.create).toHaveBeenCalledWith(courseId, mockDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Delete module', () => {
    const courseId = 1;
    const moduleId = 1;
    const mockUser = {
      sub: 1,
    } as RequestUserDto;

    it('should call service.delete with correct params', async () => {
      const mockResponse = {
        message: 'Modulo deletado.',
      };

      mockModuleService.delete.mockResolvedValue(mockResponse);

      const result = await modulesController.deleteModule(
        courseId,
        moduleId,
        mockUser,
      );

      expect(mockModuleService.delete).toHaveBeenCalledWith(
        courseId,
        moduleId,
        mockUser.sub,
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Update module', () => {
    const courseId = 1;
    const moduleId = 1;
    const mockUser = {
      sub: 1,
    } as RequestUserDto;

    it('should call service.update with correct params', async () => {
      const dto: UpdateModuleDto = {
        title: 'teste update',
      };

      const updatedModuleMock = {
        id: 1,
        courseId,
        title: 'teste update',
      };

      const responseMock = {
        message: 'Modulo atualizado',
        updatedModule: updatedModuleMock,
      };

      mockModuleService.update.mockResolvedValue(responseMock);

      const result = await modulesController.updateModule(
        courseId,
        moduleId,
        mockUser,
        dto,
      );

      expect(mockModuleService.update).toHaveBeenCalledWith(
        courseId,
        moduleId,
        mockUser.sub,
        dto,
      );
      expect(result).toEqual(responseMock);
    });
  });

  describe('ListAll modules', () => {
    const courseId = 1;

    const mockUser = {
      sub: 1,
    } as RequestUserDto;

    const page = 1;
    const limit = 10;

    it('should call service.listAllModules with corrects params', async () => {
      const total = 1;

      const modules = [
        {id: 1, title: 'module 1'},
        {id: 2, title: 'module 2'},
      ];

      const mockResponse = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: modules,
      };


      mockModuleService.listAll.mockResolvedValue(mockResponse);

      const result = await modulesController.listAllModules(courseId, mockUser);

      expect(mockModuleService.listAll).toHaveBeenCalledWith(courseId, mockUser.sub, 1, 10);
      expect(result).toEqual(mockResponse);
    });



  });

  describe('ListOne module', () => {
    const courseId = 1;
    const moduleId = 1;

     const mockUser = {
      sub: 1,
    } as RequestUserDto;

    it('should call service.listOne with corrects params', async () => {

      const mockResponse = {
        id: moduleId,
        title: 'teste',
        position: 1,
        courseId,
      }

      mockModuleService.listOne.mockResolvedValue(mockResponse);

      const result = await modulesController.listOneModule(courseId, moduleId, mockUser);

      expect(mockModuleService.listOne).toHaveBeenCalledWith(courseId, moduleId, mockUser.sub);

      expect(result).toEqual(mockResponse);
    });
    
  });

});
