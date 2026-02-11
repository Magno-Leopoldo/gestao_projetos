import apiClient from './apiClient';
import type { CalendarAllocation, UnallocatedTask, DailySummary } from '../types';

export const calendarService = {
  async getAllocations(startDate: string, endDate: string, userId?: number) {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
    if (userId) params.set('user_id', userId.toString());
    const response = await apiClient.get(`/calendar/allocations?${params}`);
    return response.data.data as CalendarAllocation[];
  },

  async getUnallocatedTasks(userId?: number) {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId.toString());
    const qs = params.toString();
    const response = await apiClient.get(`/calendar/unallocated-tasks${qs ? `?${qs}` : ''}`);
    return response.data.data as UnallocatedTask[];
  },

  async createAllocation(data: {
    task_id: number;
    allocation_date: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }) {
    const response = await apiClient.post('/calendar/allocations', data);
    return response.data as { success: boolean; data: CalendarAllocation; warning?: string };
  },

  async createBatchAllocations(data: {
    task_id: number;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    notes?: string;
    skip_weekends?: boolean;
  }) {
    const response = await apiClient.post('/calendar/allocations/batch', data);
    return response.data as {
      success: boolean;
      data: { results: { date: string; success: boolean; error?: string }[]; created: number; failed: number; total: number };
      message: string;
    };
  },

  async updateAllocation(id: number, data: {
    allocation_date?: string;
    start_time?: string;
    end_time?: string;
    notes?: string;
  }) {
    const response = await apiClient.put(`/calendar/allocations/${id}`, data);
    return response.data as { success: boolean; data: CalendarAllocation; warning?: string };
  },

  async deleteAllocation(id: number) {
    const response = await apiClient.delete(`/calendar/allocations/${id}`);
    return response.data;
  },

  async getDailySummary(date: string, userId?: number) {
    const params = new URLSearchParams({ date });
    if (userId) params.set('user_id', userId.toString());
    const response = await apiClient.get(`/calendar/daily-summary?${params}`);
    return response.data.data as DailySummary;
  },
};
