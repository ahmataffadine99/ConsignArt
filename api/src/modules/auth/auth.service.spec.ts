import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/role.enum';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'user@test.com',
      password: 'password123',
    };

    it('should successfully log in a valid active collector user', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser = {
        id: 'user-uuid',
        email: loginDto.email,
        password: hashedPassword,
        role: Role.COLLECTOR,
        isActive: true,
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mocked-token');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(jwtService.sign).toHaveBeenCalledTimes(2); // One for access token, one for refresh token
      expect(result).toEqual({
        access_token: 'mocked-token',
        refresh_token: 'mocked-token',
      });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Identifiants invalides'),
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: loginDto.email,
        password: 'hashed-password-different',
        role: Role.COLLECTOR,
        isActive: true,
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Identifiants invalides'),
      );
    });

    it('should throw pending validation message if gallery user is inactive', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser = {
        id: 'gallery-uuid',
        email: loginDto.email,
        password: hashedPassword,
        role: Role.GALLERY,
        isActive: false, // Inactive gallery
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException(
          'Votre compte galerie est en attente de validation par un administrateur',
        ),
      );
    });

    it('should throw deactivated message if standard user is inactive', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser = {
        id: 'collector-uuid',
        email: loginDto.email,
        password: hashedPassword,
        role: Role.COLLECTOR,
        isActive: false, // Inactive collector
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Ce compte est désactivé'),
      );
    });
  });

  describe('refresh', () => {
    it('should generate new tokens for a valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const decodedPayload = { sub: 'user-uuid', role: Role.COLLECTOR };

      mockJwtService.verify.mockReturnValue(decodedPayload);
      mockJwtService.sign.mockReturnValue('new-mocked-token');

      const result = await service.refresh(refreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        access_token: 'new-mocked-token',
        refresh_token: 'new-mocked-token',
      });
    });

    it('should throw UnauthorizedException if refresh token verification fails', async () => {
      const invalidToken = 'invalid-token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(service.refresh(invalidToken)).rejects.toThrow(
        new UnauthorizedException('Refresh token invalide ou expiré'),
      );
    });
  });
});
