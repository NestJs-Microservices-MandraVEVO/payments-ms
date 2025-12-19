import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecret);


    async createPaymentSession(){
        const session = await this.stripe.checkout.sessions.create({
            //aqui el ID de mi orden
            payment_intent_data: {
                metadata: {

                }
            },

            line_items:[
                {
                    price_data:{
                    currency: 'mxn',
                    product_data: {
                        name: 'Camisa'
                    },
                    unit_amount: 2000, //20.00 pesos mxn 2000 / 100 = 20.00
                    },
                    quantity: 2
                }
            ],//aqui va los items que compran
            mode: 'payment',
            success_url: 'http://localhost:3006/payments/success',
            cancel_url: 'http://localhost:3006/payments/cancel',
        });


        return session;
    }


}
