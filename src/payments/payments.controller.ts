import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}


  // @Post('create-payment-session')
  @MessagePattern({cmd: 'create.payment.session'})
  createPaymentSession(@Payload() paymentSessionDto: PaymentSessionDto){
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success(){
    return{
      ok: true,
      message: 'Payments service successfully working'
    }
  }

  @Get('cancel')
  cancel(){
    return{
      ok: false,
      message: 'Payment canceled'
    }
  }

  @Post('webhook')
  async stripeWebhook(@Req() req: Request,@Res() res: Response){
    console.log('Webhook received');
    return this.paymentsService.stripeWebhook(req, res);
  }
}
