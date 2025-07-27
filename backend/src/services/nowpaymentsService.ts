import axios from 'axios';
import crypto from 'crypto-js';

interface NOWPaymentsConfig {
  apiKey: string;
  apiUrl: string;
  ipnSecret: string;
}

interface CreatePaymentRequest {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url: string;
  success_url: string;
  cancel_url: string;
}

interface PaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  created_at: string;
  updated_at: string;
  payment_url: string;
}

interface PaymentStatusResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  actually_paid: number;
  order_id: string;
  order_description: string;
  purchase_id: string;
  outcome_amount: number;
  outcome_currency: string;
}

class NOWPaymentsService {
  private config: NOWPaymentsConfig;
  private axiosInstance;

  constructor() {
    this.config = {
      apiKey: process.env.NOWPAYMENTS_API_KEY!,
      apiUrl: process.env.NODE_ENV === 'production' 
        ? process.env.NOWPAYMENTS_API_URL!
        : process.env.NOWPAYMENTS_SANDBOX_URL!,
      ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET!
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async getAvailableCurrencies(): Promise<string[]> {
    try {
      const response = await this.axiosInstance.get('/currencies');
      return response.data.currencies;
    } catch (error: any) {
      console.error('❌ NOWPayments get currencies error:', error);
      throw new Error('Failed to fetch available currencies');
    }
  }

  async getEstimatedPrice(amount: number, currencyFrom: string, currencyTo: string): Promise<number> {
    try {
      const response = await this.axiosInstance.get('/estimate', {
        params: {
          amount,
          currency_from: currencyFrom,
          currency_to: currencyTo
        }
      });
      return response.data.estimated_amount;
    } catch (error: any) {
      console.error('❌ NOWPayments estimate error:', error);
      throw new Error('Failed to get price estimate');
    }
  }

  async createPayment(paymentData: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('🔄 Creating NOWPayments payment:', paymentData);
      
      const response = await this.axiosInstance.post('/payment', paymentData);
      
      console.log('✅ NOWPayments payment created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ NOWPayments create payment error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to create payment');
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await this.axiosInstance.get(`/payment/${paymentId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ NOWPayments get payment status error:', error);
      throw new Error('Failed to get payment status');
    }
  }

  verifyIPNSignature(body: string, signature: string): boolean {
    try {
      const expectedSignature = crypto.HmacSHA512(body, this.config.ipnSecret).toString();
      return expectedSignature === signature;
    } catch (error) {
      console.error('❌ IPN signature verification error:', error);
      return false;
    }
  }
}

export default new NOWPaymentsService();
