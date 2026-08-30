import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a collector user (isActive should be true)', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@collector.com',
        password: 'password123',
        role: Role.COLLECTOR,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((dto) => dto);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve({ id: 'some-uuid', ...user }),
      );

      const result = await service.create(createUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.isActive).toBe(true);
      expect(result.password).not.toBe(createUserDto.password); // Password should be hashed
      expect(await bcrypt.compare(createUserDto.password, result.password)).toBe(true);
    });

    it('should create a gallery user as inactive by default (isActive should be false)', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@gallery.com',
        password: 'password123',
        role: Role.GALLERY,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((dto) => dto);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve({ id: 'some-uuid', ...user }),
      );

      const result = await service.create(createUserDto);

      expect(result.isActive).toBe(false);
    });

    it('should throw ConflictException if the email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@user.com',
        password: 'password123',
        role: Role.COLLECTOR,
      };

      mockUserRepository.findOne.mockResolvedValue({ id: '1', email: 'existing@user.com' });

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const usersList = [{ id: '1', email: 'user1@test.com' }, { id: '2', email: 'user2@test.com' }];
      mockUserRepository.find.mockResolvedValue(usersList);

      const result = await service.findAll();
      expect(result).toEqual(usersList);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id if found', async () => {
      const user = { id: '123', email: 'test@test.com' };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('123');
      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
    });

    it('should return null if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('999');
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: '123', email: 'test@test.com' };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('test@test.com');
      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    });
  });

  describe('update', () => {
    it('should successfully update a user and return the updated user', async () => {
      const updateUserDto = { email: 'updated@test.com' };
      const originalUser = { id: '123', email: 'test@test.com' };
      const updatedUser = { id: '123', email: 'updated@test.com' };

      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update('123', updateUserDto);
      expect(mockUserRepository.update).toHaveBeenCalledWith('123', updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error if the user is not found after updating', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 0 });
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', { email: 'test@test.com' })).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('123');
      expect(mockUserRepository.delete).toHaveBeenCalledWith('123');
    });
  });
});
