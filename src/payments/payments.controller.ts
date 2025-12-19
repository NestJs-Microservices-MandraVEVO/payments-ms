import { Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}


  @Post('create-payment-session')
  createPaymentSession(){
    return this.paymentsService.createPaymentSession();
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
  async stripeWebhook(){
    return 'stripe webhook';
  }
}
