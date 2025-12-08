import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { RequestUserDto } from 'src/common/dto/request-user.dto';
import { CreateFakePaymentDto } from './dto/create-fake-payment.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post('/course/:courseId')
  @UseGuards(JwtAuthGuard)
  coursePurchase(
    @Param('courseId', ParseIntPipe) courseId: number,
    @GetUser() user: RequestUserDto,
    @Body() paymentData: CreateFakePaymentDto,
  ) {
    const studentId = user.sub;
    return this.purchasesService.purchase(courseId, studentId, paymentData);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  listMyPurchases(@GetUser() user: RequestUserDto) {
    const studentId = user.sub;
    return this.purchasesService.listAllMyPurchases(studentId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  listAllPurchases(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.purchasesService.listAllPurchases(Number(page), Number(limit));
  }

  @Post(':purchaseId/refund')
  @UseGuards(JwtAuthGuard)
  refundPurchase(
    @Param('purchaseId', ParseIntPipe) purchaseId: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.purchasesService.refund(purchaseId, user);
  }
}
