import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecret);


    async createPaymentSession(paymentSessionDto : PaymentSessionDto){

        const {currency, items} = paymentSessionDto;
        const lineItems = items.map( item => {
            return {
                  price_data:{
                    currency: currency,
                    product_data: {
                        name: item.name
                    },
                    unit_amount: Math.round(item.price * 100), //20.00 pesos mxn 2000 / 100 = 20.00, esto redondea eh
                    },
                    quantity: item.quantity
            }
        })


        const session = await this.stripe.checkout.sessions.create({
            //aqui el ID de mi orden
            payment_intent_data: {
                metadata: {}
            },

            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:3006/payments/success',
            cancel_url: 'http://localhost:3006/payments/cancel',
        });


        return session;
    }


    async stripeWebhook(req: Request, res: Response){
        const sig = req.headers['stripe-signature'];

        let event: Stripe.Event;
        const endpointSecret = "whsec_57bb896baaa8e5b45bf107749e9f1d31b31f44c90566abf9d8af4788fef93e54"
        
        try{
            event = this.stripe.webhooks.constructEvent(
                req['rawBody'],
                sig as string,
                endpointSecret);    
        }catch(error){
            res.status(400).send(`Webhook Error: ${error.message}`);
            return;
        }

        console.log({event});
        return res.status(200).json({sig});
    }


}
