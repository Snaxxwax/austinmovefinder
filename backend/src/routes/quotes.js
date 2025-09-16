import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { Quote } from '../models/Quote.js';
import { Customer } from '../models/Customer.js';
import { calculateTotalQuote } from '../services/PricingService.js';
import { ObjectDetectionService } from '../services/ObjectDetectionService.js';
import { EmailService } from '../services/EmailService.js';

const router = express.Router();

// Validation middleware
const validateQuote = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('move_type').isIn(['local', 'long-distance', 'commercial', 'storage']).withMessage('Invalid move type'),
  body('move_date').isISO8601().withMessage('Valid move date is required'),
  body('from_address').notEmpty().withMessage('From address is required'),
  body('estimated_size').isIn(['studio', '1br', '2br', '3br', '4br+', 'commercial']).withMessage('Invalid estimated size')
];

// POST /api/quotes - Create new quote
router.post('/', validateQuote, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      name,
      email,
      phone,
      move_type,
      move_date,
      from_address,
      to_address,
      estimated_size,
      special_items,
      notes
    } = req.body;

    // Create or find customer
    const customer = await Customer.create({ name, email, phone });

    // Create quote
    const quote = await Quote.create({
      customer_id: customer.id,
      move_type,
      move_date,
      from_address,
      to_address,
      estimated_size,
      special_items,
      notes
    });

    // Calculate initial estimate
    const estimatedCost = calculateTotalQuote({
      estimated_size,
      move_type,
      move_date,
      from_address,
      to_address
    });

    await Quote.update(quote.id, { estimated_cost: estimatedCost });
    quote.estimated_cost = estimatedCost;

    res.status(201).json({
      success: true,
      data: {
        quote: quote.toJSON(),
        customer: customer.toJSON(),
        estimated_cost: estimatedCost
      }
    });

  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create quote',
      message: error.message
    });
  }
});

// POST /api/quotes/:id/items - Add detected items to quote
router.post('/:id/items', [
  param('id').isInt().withMessage('Valid quote ID required'),
  body('items').isArray().withMessage('Items array is required'),
  body('items.*.item_label').notEmpty().withMessage('Item label is required'),
  body('items.*.confidence_score').isFloat({ min: 0, max: 1 }).withMessage('Valid confidence score required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const quoteId = req.params.id;
    const { items } = req.body;

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    // Add detected items
    const addedItems = [];
    for (const item of items) {
      await quote.addDetectedItem(item);
      addedItems.push(item);
    }

    // Recalculate quote cost with detected items
    const detectedItems = await quote.getDetectedItems();
    const updatedCost = calculateTotalQuote(quote.toJSON(), detectedItems);
    
    await Quote.update(quote.id, { estimated_cost: updatedCost });

    res.json({
      success: true,
      data: {
        items_added: addedItems.length,
        detected_items: detectedItems,
        updated_cost: updatedCost
      }
    });

  } catch (error) {
    console.error('Error adding items to quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add items to quote',
      message: error.message
    });
  }
});

// GET /api/quotes/:id - Get quote by ID
router.get('/:id', [
  param('id').isInt().withMessage('Valid quote ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    // Get related data
    const customer = await Customer.findById(quote.customer_id);
    const detectedItems = await quote.getDetectedItems();
    const mediaFiles = await quote.getMediaFiles();

    res.json({
      success: true,
      data: {
        quote: quote.toJSON(),
        customer: customer.toJSON(),
        detected_items: detectedItems,
        media_files: mediaFiles
      }
    });

  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quote',
      message: error.message
    });
  }
});

// PUT /api/quotes/:id - Update quote
router.put('/:id', [
  param('id').isInt().withMessage('Valid quote ID required'),
  body('move_type').optional().isIn(['local', 'long-distance', 'commercial', 'storage']),
  body('move_date').optional().isISO8601(),
  body('estimated_size').optional().isIn(['studio', '1br', '2br', '3br', '4br+', 'commercial']),
  body('status').optional().isIn(['pending', 'quoted', 'booked', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    // Update quote
    const updatedQuote = await Quote.update(req.params.id, req.body);

    // Recalculate cost if relevant fields changed
    const costRelevantFields = ['move_type', 'move_date', 'estimated_size', 'from_address', 'to_address'];
    const shouldRecalculate = Object.keys(req.body).some(key => costRelevantFields.includes(key));

    if (shouldRecalculate) {
      const detectedItems = await updatedQuote.getDetectedItems();
      const newCost = calculateTotalQuote(updatedQuote.toJSON(), detectedItems);
      await Quote.update(updatedQuote.id, { estimated_cost: newCost });
      updatedQuote.estimated_cost = newCost;
    }

    res.json({
      success: true,
      data: updatedQuote.toJSON()
    });

  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update quote',
      message: error.message
    });
  }
});

// POST /api/quotes/:id/submit - Submit quote and send emails
router.post('/:id/submit', [
  param('id').isInt().withMessage('Valid quote ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    const customer = await Customer.findById(quote.customer_id);
    const detectedItems = await quote.getDetectedItems();
    const mediaFiles = await quote.getMediaFiles();

    // Update quote status to quoted
    await Quote.update(quote.id, { status: 'quoted' });

    // Send emails
    const emailService = new EmailService();
    
    try {
      // Prepare email data
      const emailData = {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        moveType: quote.move_type,
        moveDate: quote.move_date,
        fromAddress: quote.from_address,
        toAddress: quote.to_address || '',
        estimatedSize: quote.estimated_size,
        specialItems: quote.special_items || '',
        notes: quote.notes || '',
        detectedItems: detectedItems.map(item => `${item.item_label} (${item.quantity || 1}x)`).join(', '),
        totalCost: quote.estimated_cost,
        mediaFileCount: mediaFiles.length,
        submissionTime: new Date().toLocaleString()
      };

      // Send business notification
      await emailService.sendQuoteNotification(emailData);
      
      // Send customer confirmation
      await emailService.sendCustomerConfirmation(emailData);

      res.json({
        success: true,
        message: 'Quote submitted successfully and emails sent',
        data: {
          quote: quote.toJSON(),
          customer: customer.toJSON(),
          detected_items: detectedItems,
          media_files: mediaFiles
        }
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // Still return success since quote was created, but note email issue
      res.json({
        success: true,
        message: 'Quote submitted successfully, but email notification failed',
        warning: 'Please contact customer directly',
        data: {
          quote: quote.toJSON(),
          customer: customer.toJSON(),
          detected_items: detectedItems,
          media_files: mediaFiles
        }
      });
    }

  } catch (error) {
    console.error('Error submitting quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit quote',
      message: error.message
    });
  }
});

// GET /api/quotes - List quotes (with pagination and filtering)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      move_type,
      customer_id
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let params = [];

    if (status) {
      whereConditions.push('q.status = ?');
      params.push(status);
    }

    if (move_type) {
      whereConditions.push('q.move_type = ?');
      params.push(move_type);
    }

    if (customer_id) {
      whereConditions.push('q.customer_id = ?');
      params.push(customer_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get quotes with customer info
    const sql = `
      SELECT q.*, c.name as customer_name, c.email as customer_email,
             COUNT(mi.id) as media_count,
             COUNT(di.id) as items_count
      FROM quotes q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN media_files mi ON q.id = mi.quote_id
      LEFT JOIN detected_items di ON q.id = di.quote_id
      ${whereClause}
      GROUP BY q.id
      ORDER BY q.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), offset);
    
    const quotes = await database.all(sql, params);

    // Get total count for pagination
    const countSql = `
      SELECT COUNT(DISTINCT q.id) as total
      FROM quotes q
      ${whereClause}
    `;
    
    const countResult = await database.get(countSql, params.slice(0, -2)); // Remove limit and offset
    const total = countResult.total;

    res.json({
      success: true,
      data: {
        quotes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quotes',
      message: error.message
    });
  }
});

export default router;