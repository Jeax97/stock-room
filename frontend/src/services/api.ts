import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ---- Dashboard ----
export const getDashboardStats = () => api.get('/dashboard').then(r => r.data);

// ---- Products ----
export const getProducts = (params?: Record<string, any>) => api.get('/products', { params }).then(r => r.data);
export const getProduct = (id: number) => api.get(`/products/${id}`).then(r => r.data);
export const getProductByBarcode = (code: string) => api.get(`/products/barcode/${code}`).then(r => r.data);
export const createProduct = (data: any) => api.post('/products', data).then(r => r.data);
export const updateProduct = (id: number, data: any) => api.put(`/products/${id}`, data).then(r => r.data);
export const deleteProduct = (id: number) => api.delete(`/products/${id}`).then(r => r.data);
export const uploadProductPhoto = (id: number, file: File) => {
  const formData = new FormData();
  formData.append('photo', file);
  return api.post(`/products/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

// ---- Categories ----
export const getCategories = () => api.get('/categories').then(r => r.data);
export const createCategory = (name: string) => api.post('/categories', { name }).then(r => r.data);
export const updateCategory = (id: number, name: string) => api.put(`/categories/${id}`, { name }).then(r => r.data);
export const deleteCategory = (id: number) => api.delete(`/categories/${id}`).then(r => r.data);

// ---- Subcategories ----
export const getSubcategories = (categoryId?: number) =>
  api.get('/subcategories', { params: categoryId ? { categoryId } : {} }).then(r => r.data);
export const createSubcategory = (name: string, categoryId: number) =>
  api.post('/subcategories', { name, categoryId }).then(r => r.data);
export const updateSubcategory = (id: number, data: { name: string; categoryId?: number }) =>
  api.put(`/subcategories/${id}`, data).then(r => r.data);
export const deleteSubcategory = (id: number) => api.delete(`/subcategories/${id}`).then(r => r.data);

// ---- Locations ----
export const getLocations = () => api.get('/locations').then(r => r.data);
export const createLocation = (data: { name: string; description?: string }) => api.post('/locations', data).then(r => r.data);
export const updateLocation = (id: number, data: { name: string; description?: string }) => api.put(`/locations/${id}`, data).then(r => r.data);
export const deleteLocation = (id: number) => api.delete(`/locations/${id}`).then(r => r.data);

// ---- Units ----
export const getUnits = () => api.get('/units').then(r => r.data);
export const createUnit = (data: { name: string; symbol: string }) => api.post('/units', data).then(r => r.data);
export const updateUnit = (id: number, data: { name: string; symbol: string }) => api.put(`/units/${id}`, data).then(r => r.data);
export const deleteUnit = (id: number) => api.delete(`/units/${id}`).then(r => r.data);

// ---- Suppliers ----
export const getSuppliers = () => api.get('/suppliers').then(r => r.data);
export const createSupplier = (data: { name: string; contactInfo?: string }) => api.post('/suppliers', data).then(r => r.data);
export const updateSupplier = (id: number, data: { name: string; contactInfo?: string }) => api.put(`/suppliers/${id}`, data).then(r => r.data);
export const deleteSupplier = (id: number) => api.delete(`/suppliers/${id}`).then(r => r.data);

// ---- Movements ----
export const getMovements = (params?: Record<string, any>) => api.get('/movements', { params }).then(r => r.data);
export const getProductMovements = (productId: number) => api.get(`/movements/product/${productId}`).then(r => r.data);
export const createMovement = (data: { productId: number; type: string; quantity: number; reason?: string }) =>
  api.post('/movements', data).then(r => r.data);

// ---- Notifications ----
export const getNotifications = (params?: Record<string, any>) => api.get('/notifications', { params }).then(r => r.data);
export const getUnreadCount = () => api.get('/notifications/unread-count').then(r => r.data);
export const markNotificationRead = (id: number) => api.put(`/notifications/${id}/read`).then(r => r.data);
export const markAllNotificationsRead = () => api.put('/notifications/mark-all-read').then(r => r.data);

// ---- Settings ----
export const getSettings = () => api.get('/settings').then(r => r.data);
export const updateSettings = (data: any) => api.put('/settings', data).then(r => r.data);

// ---- Export ----
export const exportCSV = (params?: Record<string, any>) =>
  api.get('/export/csv', { params, responseType: 'blob' }).then(r => r.data);
export const exportExcel = (params?: Record<string, any>) =>
  api.get('/export/excel', { params, responseType: 'blob' }).then(r => r.data);
export const exportPDF = (params?: Record<string, any>) =>
  api.get('/export/pdf', { params, responseType: 'blob' }).then(r => r.data);

export default api;
