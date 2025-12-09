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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  // ------------------------------------
  // PURCHASE COURSE
  // ------------------------------------
  @Post('/course/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Realizar compra de um curso' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiResponse({ status: 201, description: 'Compra realizada com sucesso' })
  coursePurchase(
    @Param('courseId', ParseIntPipe) courseId: number,
    @GetUser() user: RequestUserDto,
    @Body() paymentData: CreateFakePaymentDto,
  ) {
    return this.purchasesService.purchase(courseId, user.sub, paymentData);
  }

  // ------------------------------------
  // LIST MY PURCHASES
  // ------------------------------------
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar compras feitas pelo usuário logado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de compras do usuário autenticado',
  })
  listMyPurchases(@GetUser() user: RequestUserDto) {
    return this.purchasesService.listAllMyPurchases(user.sub);
  }

  // ------------------------------------
  // LIST ALL PURCHASES (ADMIN)
  // ------------------------------------
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas as compras (ADMIN)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas as compras retornada com sucesso',
  })
  listAllPurchases(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.purchasesService.listAllPurchases(Number(page), Number(limit));
  }

  // ------------------------------------
  // REFUND PURCHASE
  // ------------------------------------
  @Post(':purchaseId/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Solicitar reembolso de uma compra' })
  @ApiParam({ name: 'purchaseId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Reembolso processado com sucesso',
  })
  refundPurchase(
    @Param('purchaseId', ParseIntPipe) purchaseId: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.purchasesService.refund(purchaseId, user);
  }
}
