const express = require('express');
const router = express.Router();
const ShoppingCartService = require('../services/shoppingCartService');
const CheckoutService = require('../services/checkoutService');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Apply authentication middleware to all cart routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's shopping cart
 *     tags: [Shopping Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shopping cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cartId:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *                 totalPrice:
 *                   type: number
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  try {
    const cart = await ShoppingCartService.getCartSummary(req.user.id);
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add tour to shopping cart
 *     tags: [Shopping Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tourId
 *             properties:
 *               tourId:
 *                 type: integer
 *                 description: ID of the tour to add to cart
 *     responses:
 *       200:
 *         description: Tour added to cart successfully
 *       400:
 *         description: Bad request (tour already in cart, not published, etc.)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tour not found
 */
router.post('/add', requireRole(['turista']), async (req, res) => {
  try {
    const { tourId } = req.body;

    if (!tourId) {
      return res.status(400).json({ error: 'Tour ID je obavezan' });
    }

    const cart = await ShoppingCartService.addToCart(req.user.id, tourId);
    res.json({
      message: 'Tura je dodana u korpu',
      cart: await ShoppingCartService.getCartSummary(req.user.id)
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cart/remove:
 *   delete:
 *     summary: Remove tour from shopping cart
 *     tags: [Shopping Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tourId
 *             properties:
 *               tourId:
 *                 type: integer
 *                 description: ID of the tour to remove from cart
 *     responses:
 *       200:
 *         description: Tour removed from cart successfully
 *       400:
 *         description: Bad request (tour not in cart)
 *       401:
 *         description: Unauthorized
 */
router.delete('/remove', requireRole(['turista']), async (req, res) => {
  try {
    const { tourId } = req.body;

    if (!tourId) {
      return res.status(400).json({ error: 'Tour ID je obavezan' });
    }

    const cart = await ShoppingCartService.removeFromCart(req.user.id, tourId);
    res.json({
      message: 'Tura je uklonjena iz korpe',
      cart: await ShoppingCartService.getCartSummary(req.user.id)
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear all items from shopping cart
 *     tags: [Shopping Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/clear', requireRole(['turista']), async (req, res) => {
  try {
    const cart = await ShoppingCartService.clearCart(req.user.id);
    res.json({
      message: 'Korpa je ispražnjena',
      cart: await ShoppingCartService.getCartSummary(req.user.id)
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cart/checkout/summary:
 *   get:
 *     summary: Get checkout summary before processing
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checkout summary retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/checkout/summary', requireRole(['turista']), async (req, res) => {
  try {
    const summary = await CheckoutService.getCheckoutSummary(req.user.id);
    res.json(summary);
  } catch (error) {
    console.error('Checkout summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cart/checkout:
 *   post:
 *     summary: Process checkout and purchase all items in cart
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checkout processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 purchaseTokens:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalAmount:
 *                   type: number
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request (empty cart, invalid items, etc.)
 *       401:
 *         description: Unauthorized
 */
router.post('/checkout', requireRole(['turista']), async (req, res) => {
  try {
    const result = await CheckoutService.processCheckout(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cart/purchases:
 *   get:
 *     summary: Get user's purchase history
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Purchase history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/purchases', async (req, res) => {
  try {
    const purchases = await CheckoutService.getPurchaseHistory(req.user.id);
    res.json(purchases);
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cart/purchases/check/{tourId}:
 *   get:
 *     summary: Check if user owns a specific tour
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tour ID to check ownership
 *     responses:
 *       200:
 *         description: Ownership status checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 owns:
 *                   type: boolean
 *                 tourId:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/purchases/check/:tourId', async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);
    const owns = await ShoppingCartService.checkTourOwnership(req.user.id, tourId);
    res.json({ owns, tourId });
  } catch (error) {
    console.error('Check ownership error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cart/validate/{tourId}:
 *   get:
 *     summary: Validate purchase token for tour execution
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tour ID to validate token for
 *     responses:
 *       200:
 *         description: Token validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/validate/:tourId', async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);
    const validation = await CheckoutService.validatePurchaseToken(req.user.id, tourId);
    res.json(validation);
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;