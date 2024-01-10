import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Meeting } from '../meeting/meeting.entity';
import { QuickOrder } from './quick-order.entity';
import { User } from '../user/user.entity';
import axios from 'axios';
import { IS_DEV } from 'src/utils/const';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const schedule = require('node-schedule');

const baseURL = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  production: 'https://api-m.paypal.com',
};

enum PaypalOrderStatus {
  CREATED = 'CREATED',
  COMPLETED = 'COMPLETED',
}

enum OrderStatus {
  preOrder = 1000,
  createOrder = 1001,
  cancelOrder = 1002,
  paymentSuccessful = 2001,
  paymentFailed = 2002,
  tradeSuccessful = 3001,
  tradeFailed = 3002,
}

export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    @InjectRepository(QuickOrder)
    private readonly quickOrderRepository: Repository<QuickOrder>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  private accessTokenTime: number = 0;
  private accessToken: string = '';
  private currencyCode: string = 'USD';
  private paypalUrl: string = IS_DEV ? baseURL.sandbox : baseURL.production;

  /**
   * 美分转换美元
   *
   * @private
   * @param {number} val
   * @return {*}  {string}
   * @memberof OrderService
   */
  private currencyConversion(val: number): string {
    return `${val / 100}`;
  }

  async getOrderInfoByOrderId(order_id: string) {
    const sql = `SELECT o.order_id, o.order_status, o.order_time, o.price, o.meeting_teacher_id, o.meeting_teacher_fname, o.meeting_teacher_lname, o.meeting_id, m.order_time meeting_time
    FROM \`order\` o
    JOIN meeting m ON o.meeting_id = m.meeting_id
    WHERE o.order_id = '${order_id}'`;
    try {
      const data = await this.orderRepository.query(sql);
      return data[0];
    } catch (error) {
      throw new Error('Data error');
    }
  }

  async getOrderList(uid) {
    if (!uid) throw new Error('uid is empty');
    const sql = `SELECT o.order_id, o.order_status, o.order_time, o.price, o.meeting_teacher_id, o.meeting_teacher_fname, o.meeting_teacher_lname, o.meeting_id, m.order_time meeting_time
    FROM \`order\` o
    JOIN meeting m ON o.meeting_id = m.meeting_id
    WHERE o.student_id = '${uid}'`;
    try {
      const data = await this.orderRepository.query(sql);
      return data;
    } catch (error) {
      throw new Error('Data error');
    }
  }

  async cancelOrder(order_id: string, orderStatus: OrderStatus.cancelOrder | OrderStatus.paymentFailed) {
    const order = await this.orderRepository.findOneBy({ order_id });
    if (!order) {
      throw new Error('Order not found');
    }

    try {
      await this.orderRepository.manager.transaction(async transactionalEntityManager => {
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Order)
          .set({
            order_status: orderStatus,
          })
          .where('order_id = :order_id', { order_id })
          .execute();
        await transactionalEntityManager.createQueryBuilder().update(Meeting).set({ order_status: 0, lock_time: '0' }).where('meeting_id = :meeting_id', { meeting_id: order.meeting_id }).execute();
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(QuickOrder)
          .values({
            order_id,
            order_status: orderStatus,
            order_text: 'Automatically cancel orders',
          })
          .execute();
      });
    } catch (error) {
      throw new Error('Service error');
    }
    return true;
  }

  async preCreateOrder(orderInfo) {
    const { meeting_id, uid } = orderInfo;
    const findMeeting = await this.meetingRepository.findOneBy({ meeting_id });

    if (!findMeeting) {
      throw new Error('Meeting not found'); // 会议不存在
    }
    if (findMeeting.status !== 2) {
      throw new Error('Invalid meeting'); // 会议无效
    }
    if (findMeeting.order_status === 1) {
      throw new Error('Meeting already scheduled'); // 会议已预定
    }

    const studentInfo = await this.userRepository.findOneBy({ uid, status: 1 });
    if (!studentInfo) {
      throw new Error('Student not found'); // 学生不存在
    }

    const meetingCreator = await this.userRepository.findOneBy({ uid: findMeeting.teacher_id, status: 1 });
    if (!meetingCreator) {
      throw new Error('Teacher not found'); // 老师不存在
    }

    try {
      let order_id = '0';
      const orderStatus = OrderStatus.preOrder;
      await this.orderRepository.manager.transaction(async transactionalEntityManager => {
        const now = Date.now().toString();
        const info = {
          ...orderInfo,
          order_status: orderStatus,
          push_status: 0,
          order_time: now,
          student_id: uid,
          meeting_id,
          meeting_teacher_id: findMeeting.teacher_id,
          meeting_teacher_fname: meetingCreator.fname,
          meeting_teacher_lname: meetingCreator.lname,
          price: findMeeting.price,
          status: 1,
        };
        const data = await transactionalEntityManager.createQueryBuilder().insert().into(Order).values(info).execute();
        order_id = data.identifiers[0].order_id;
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Meeting)
          .set({
            lock_time: now,
            order_status: 1,
          })
          .where('meeting_id = :meeting_id', { meeting_id })
          .execute();
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(QuickOrder)
          .values({
            order_id,
            order_status: orderStatus,
            order_text: 'The meeting order was created successfully',
          })
          .execute();
      });
      const time = new Date(Date.now() + 5 * 60 * 1000);
      schedule.scheduleJob(time, () => {
        this.cancelOrder(order_id, OrderStatus.cancelOrder);
      });
      return {
        order_id,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create meeting'); // 会议创建失败
    }
  }

  async getAccessToken() {
    const now = Math.floor(Date.now() / 1000);
    if (now < this.accessTokenTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.paypalUrl}/v1/oauth2/token`,
        {
          grant_type: 'client_credentials',
        },
        {
          auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      if (response?.data?.access_token) {
        const expires = response.data.expires_in;
        this.accessTokenTime = Math.floor(Date.now() / 1000) + expires;
        this.accessToken = response.data.access_token;
        return this.accessToken;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async buy(body) {
    const { order_id, payment_order } = body;

    const now = Date.now().toString();
    const orderStatus = OrderStatus.createOrder;
    try {
      await this.orderRepository.manager.transaction(async transactionalEntityManager => {
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Order)
          .set({
            order_status: orderStatus,
            create_pay_order_time: now,
            payment_order,
            payment_type: 1,
          })
          .where('order_id = :order_id', { order_id })
          .execute();
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(QuickOrder)
          .values({
            order_id,
            order_status: orderStatus,
            order_text: 'Payment order created successfully',
          })
          .execute();
      });

      const time = Date.now() + 15 * 60 * 1000;
      schedule.scheduleJob(new Date(time), () => {
        this.cancelOrder(order_id, OrderStatus.paymentFailed);
      });

      return {
        order_id,
        order_time: now,
        order_status: orderStatus,
      };
    } catch (error) {
      throw new Error('Order payment failed'); // 订单支付失败
    }
  }

  async createOrder(body) {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('Failed to get access token');
    }

    const { cart } = body;
    const orderId = cart[0].sku;

    const order = await this.orderRepository.findOneBy({ order_id: orderId });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (!(order.status === 1 && [OrderStatus.preOrder, OrderStatus.createOrder].includes(order.order_status))) {
      throw new Error('Invalid order'); // 订单无效
    }

    try {
      const data = JSON.stringify({
        purchase_units: [
          {
            amount: {
              currency_code: this.currencyCode,
              value: this.currencyConversion(order.price),
            },
            // reference_id: 'd9f80740-38f0-11e8-b467-0ed5f89f718b',
          },
        ],
        intent: 'CAPTURE',
        // payment_source: {
        //   paypal: {
        //     experience_context: {
        //       payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
        //       payment_method_selected: 'PAYPAL',
        //       brand_name: 'EXAMPLE INC',
        //       locale: 'en-US',
        //       landing_page: 'LOGIN',
        //       shipping_preference: 'SET_PROVIDED_ADDRESS',
        //       user_action: 'PAY_NOW',
        //       return_url: 'https://example.com/returnUrl',
        //       cancel_url: 'https://example.com/cancelUrl',
        //     },
        //   },
        // },
      });
      const response = await axios.post(`${this.paypalUrl}/v2/checkout/orders`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      await this.buy({ order_id: orderId, payment_order: response.data.id });
      return response.data;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to create the order.' + error.message);
    }
  }

  async paymentSuccessful(paymentOrder, orderStatus = OrderStatus.paymentSuccessful) {
    const now = Date.now().toString();
    try {
      const order = await this.orderRepository.findOneBy({ payment_order: paymentOrder });
      await this.orderRepository.manager.transaction(async transactionalEntityManager => {
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Order)
          .set({
            order_status: orderStatus,
            payment_order_time: now,
          })
          .where('order_id = :order_id', { order_id: order.order_id })
          .execute();
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Meeting)
          .set({
            order_status: 2,
          })
          .where('meeting_id = :meeting_id', { meeting_id: order.meeting_id })
          .execute();
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(QuickOrder)
          .values({
            order_id: order.order_id,
            order_status: orderStatus,
            order_text: 'Payment successful',
          })
          .execute();
      });

      return {
        order_id: order.order_id,
        order_time: now,
        order_status: orderStatus,
      };
    } catch (error) {
      throw new Error('Order payment failed'); // 订单支付失败
    }
  }

  async paymentFailed(paymentOrder, orderStatus = OrderStatus.paymentFailed) {
    const now = Date.now().toString();
    try {
      const order = await this.orderRepository.findOneBy({ payment_order: paymentOrder });
      await this.orderRepository.manager.transaction(async transactionalEntityManager => {
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Order)
          .set({
            order_status: orderStatus,
            payment_order_time: now,
          })
          .where('order_id = :order_id', { order_id: order.order_id })
          .execute();
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(QuickOrder)
          .values({
            order_id: order.order_id,
            order_status: orderStatus,
            order_text: 'Payment failed',
          })
          .execute();
      });

      return {
        order_id: order.order_id,
        order_time: now,
        order_status: orderStatus,
      };
    } catch (error) {
      throw new Error('Order payment failed'); // 订单支付失败
    }
  }

  async capture(body) {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('Failed to get access token');
    }

    const { orderID } = body;
    if (!orderID) {
      throw new Error('Not orderID');
    }

    try {
      const response = await axios.post(
        `${this.paypalUrl}/v2/checkout/orders/${orderID}/capture`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const { id, status } = response.data;
      if (status === PaypalOrderStatus.COMPLETED) {
        await this.paymentSuccessful(orderID);
        return response.data;
      }

      await this.paymentFailed(orderID);
      return response.data;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to create the order.' + error.message);
    }
  }
}
