import { strip } from './../../node_modules/@colors/colors/index.d';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { url } from 'inspector';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService implements OnModuleInit {

    private readonly stripe = new Stripe(envs.stripeSecret);
    private readonly logger = new Logger('PaymentsService');

    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy
    ){}

    async onModuleInit() {
        await this.client.connect();
        this.logger.log('NATS client connected');
    }


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

        switch(event.type){
            case 'charge.succeeded':
            const chargeSucceded = event.data.object;
            
            // Obtener el payment intent para acceder al metadata
            const paymentIntent = await this.stripe.paymentIntents.retrieve(
                chargeSucceded.payment_intent as string
            );
            
            const payload = {
                stripePaymentId: chargeSucceded.id,
                orderId: paymentIntent.metadata.orderId,
                receiptUrl: chargeSucceded.receipt_url,
            }
           
            this.logger.log(`Payment succeeded for order ${payload.orderId}`);
            
            this.client.emit('payment.succeeded', payload);
            break;

        default:
            this.logger.log(`Unhandled event type ${event.type}`);
        }

        
        return res.status(200).json({sig});
    }


}
