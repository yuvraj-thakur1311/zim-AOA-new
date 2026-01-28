import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    image?: Express.Multer.File,
  ): Promise<Order> {
    const order = this.orderRepository.create({
      ...createOrderDto,
      status: createOrderDto.status || OrderStatus.PENDING, // Default to PENDING
      order_date: new Date(createOrderDto.order_date),
      expected_delivery: new Date(createOrderDto.expected_delivery),

      image: image ? image.buffer : null,
      image_mime_type: image ? image.mimetype : null,
    });

    return await this.orderRepository.save(order);
  }

  async getOrders(query: GetOrdersDto) {
    const { patient_id, status, page = 1, limit = 10 } = query;

    const qb = this.orderRepository.createQueryBuilder('order');

    if (patient_id) {
      qb.andWhere('order.patient_id = :patient_id', { patient_id });
    }

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    qb.orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrdersByPatientId(patientId: string, page = 1, limit = 10) {
    const qb = this.orderRepository.createQueryBuilder('order');

    qb.where('order.patient_id = :patientId', { patientId })
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await qb.getManyAndCount();

    // Convert image Buffer to Base64 for safe JSON
    const ordersWithImages = orders.map((order) => {
      const obj: any = { ...order };
      if (order.image) {
        obj.image = order.image.toString('base64');
      }
      return obj;
    });

    return {
      data: ordersWithImages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { order_id: orderId },
    });

    if (!order) {
      return null;
    }

    return {
      ...order,
      image: order.image
        ? order.image.toString('base64') // 🔥 KEY FIX
        : null,
    };
  }
}
