import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFakePaymentDto } from './dto/create-fake-payment.dto';
import { RequestUserDto } from 'src/common/dto/request-user.dto';

@Injectable()
export class PurchasesService {
  constructor(private readonly prismaService: PrismaService) {}

  validatePayment(paymentData: CreateFakePaymentDto) {
    if (paymentData.cardNumber.length !== 16) {
      throw new BadRequestException('Número do cartão inválido');
    }

    if (paymentData.cvv.length !== 3) {
      throw new BadRequestException('Código de segurança inválido');
    }

    const now = new Date();
    const expDate = new Date(
      Number('20' + paymentData.expYear),
      Number(paymentData.expMonth),
    );

    if (expDate < now) {
      throw new BadRequestException('Cartão expirado');
    }
  }

  generationTransactionId() {
    return 'txn_' + Math.random().toString(36).substring(2, 12);
  }

  purchase = async (
    courseId: number,
    studentId: number,
    paymentData: CreateFakePaymentDto,
  ) => {
    const course = await this.prismaService.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) throw new NotFoundException('Curso não encontrado.');

    if (course.status === 'DRAFT') {
      throw new UnauthorizedException(
        'Este curso ainda não está disponível para compra',
      );
    }

    const existingPurchase = await this.prismaService.purchase.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    if (existingPurchase)
      throw new HttpException(
        'Você já comprou esse curso',
        HttpStatus.BAD_REQUEST,
      );

    this.validatePayment(paymentData);

    const transactionId = this.generationTransactionId();

    const purchase = await this.prismaService.purchase.create({
      data: {
        studentId,
        courseId,
        price: course.price,
        transactionId,
        status: 'PAID',
      },
      include: {
        course: true,
        student: true,
      },
    });

    return {
      message: 'Compra realizada com sucesso!',
      transactionId,
      purchase,
    };
  };

  listAllMyPurchases = async (studentId: number) => {
    const purchases = await this.prismaService.purchase.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            title: true,
            price: true,
            imageUrl: true,
            teacher: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return purchases;
  };

  listAllPurchases = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [total, purchases] = await this.prismaService.$transaction([
      this.prismaService.purchase.count(),
      this.prismaService.purchase.findMany({
        skip,
        take: limit,
        include: {
          course: {
            select: { title: true },
          },
          student: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: purchases,
    };
  };

  refund = async (purchaseId: number, user: RequestUserDto) => {
    const purchase = await this.prismaService.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        course: {
          include: { teacher: true },
        },
      },
    });

    if (!purchase) throw new NotFoundException('Compra não encontrada.');

    const isAdmin = user.role === 'ADMIN';
    const isTeacherOwner = user.sub === purchase.course.teacherId;

    if (!isAdmin && !isTeacherOwner) {
      throw new ForbiddenException(
        'Você não tem permissão para reembolsar esta compra.',
      );
    }

    if (purchase.status !== 'PAID') {
      throw new BadRequestException(
        'Apenas compras pagas podem ser reembolsadas.',
      );
    }

    const refunded = await this.prismaService.purchase.update({
      where: { id: purchaseId },
      data: {
        status: 'CANCELED',
      },
      include: {
        course: {
          select: {
            title: true,
            price: true,
            teacher: true,
          },
        },
      },
    });

    return {
      message: 'Compra reembolsada com sucesso.',
      refunded,
    };
  };
}
