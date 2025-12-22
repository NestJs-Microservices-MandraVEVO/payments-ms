import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { url } from 'inspector';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecret);


    async createPaymentSession(paymentSessionDto : PaymentSessionDto){

        const {currency, items, orderId} = paymentSessionDto;
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
                metadata: {
                    orderId: orderId
                }
            },

            line_items: lineItems,
            mode: 'payment',
            success_url: envs.stripeSuccessUrl,
            cancel_url: envs.stripeCancelUrl,
        });


        return {
            cancelUrl: session.cancel_url,
            successUrl: session.success_url,
            url: session.url,
        }
    }


    async stripeWebhook(req: Request, res: Response){
        const sig = req.headers['stripe-signature'];

        let event: Stripe.Event;
        //Testing webhook secret
        //const endpointSecret = envs.stripeSecret
        //Production webhook secret
        const endpointSecret = envs.stripeEndpointSecret;

        try{
            event = this.stripe.webhooks.constructEvent(
                req['rawBody'],
                sig as string,
                endpointSecret);    
        }catch(error){
            res.status(400).send(`Webhook Error: ${error.message}`);
            return;
        }

        console.log({event})
        switch(event.type){
            case 'charge.succeeded':
                const chargeSucceded = event.data.object;
            //TODO: llamar a nuestro microservicio de ordenes para actualizar el estado de la orden
            console.log({
                metadata: chargeSucceded.metadata,
                orderId: chargeSucceded.metadata.orderId,
            });
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
        }

        
        return res.status(200).json({sig});
    }


}
