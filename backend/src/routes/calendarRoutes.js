import express from 'express';
import {
  getCalendarAllocations,
  getUnallocatedTasks,
  createCalendarAllocation,
  createBatchCalendarAllocations,
  updateCalendarAllocation,
  deleteCalendarAllocation,
  deleteBatchCalendarAllocations,
  getDailySummary,
} from '../controllers/calendarController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticate);

router.get('/allocations', getCalendarAllocations);
router.get('/unallocated-tasks', getUnallocatedTasks);
router.get('/daily-summary', getDailySummary);
router.post('/allocations', createCalendarAllocation);
router.post('/allocations/batch', createBatchCalendarAllocations);
router.put('/allocations/:id', updateCalendarAllocation);
router.post('/allocations/delete-batch', deleteBatchCalendarAllocations);
router.delete('/allocations/:id', deleteCalendarAllocation);

export default router;
