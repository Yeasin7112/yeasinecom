
import { Product, Order } from '../types';

const API_URL = 'api.php';

async function request(route: string, method: 'GET' | 'POST' = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}?route=${route}`, options);
  if (!response.ok) throw new Error('API request failed');
  return response.json();
}

export const apiService = {
  getProducts: () => request('products'),
  getOrders: () => request('orders'),
  addProduct: (product: Product) => request('add_product', 'POST', product),
  deleteProduct: (id: string) => request('delete_product', 'POST', { id }),
  placeOrder: (order: Order) => request('place_order', 'POST', order),
  updateOrderStatus: (id: string, status: string) => request('update_order_status', 'POST', { id, status }),
  deleteOrder: (id: string) => request('delete_order', 'POST', { id }),
};
