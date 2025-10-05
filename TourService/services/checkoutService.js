const { ShoppingCart, OrderItem, Tour, TourPurchaseToken, TourExecution } = require('../models');
const { sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');

class CheckoutService {

  // Process checkout - convert cart items to purchase tokens
  static async processCheckout(userId) {
    const transaction = await sequelize.transaction();
    
    try {
      // Get user's cart with items
      const cart = await ShoppingCart.findOne({
        where: { userId, isActive: true },
        include: [{
          model: OrderItem,
          as: 'items',
          include: [{
            model: Tour,
            as: 'tour'
          }]
        }],
        transaction
      });

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error('Korpa je prazna');
      }

      // Validate all tours are still available and have correct prices
      for (const item of cart.items) {
        const currentTour = await Tour.findByPk(item.tourId, { transaction });
        
        if (!currentTour) {
          throw new Error(`Tura "${item.tourName}" vise ne postoji`);
        }

        if (currentTour.status !== 'published') {
          throw new Error(`Tura "${item.tourName}" vise nije dostupna za kupovinu`);
        }

        if (parseFloat(currentTour.price) !== parseFloat(item.tourPrice)) {
          throw new Error(`Cena ture "${item.tourName}" se promenila. Molimo osavrezi korpu.`);
        }

        // Check if user already owns this tour
        const existingPurchase = await TourPurchaseToken.findOne({
          where: {
            userId,
            tourId: item.tourId,
            isActive: true
          },
          transaction
        });

        if (existingPurchase) {
          throw new Error(`Vec ste kupili turu "${item.tourName}"`);
        }
      }

      // Create purchase tokens for all items
      const purchaseTokens = [];
      
      for (const item of cart.items) {
        const purchaseToken = await TourPurchaseToken.create({
          userId,
          tourId: item.tourId,
          purchaseToken: uuidv4(),
          status: 'completed', // Mark as completed immediately
          purchasePrice: item.tourPrice,
          purchaseDate: new Date(),
          expiryDate: null, // Tours don't expire
          isActive: true
        }, { transaction });

        purchaseTokens.push({
          token: purchaseToken.purchaseToken,
          tourId: item.tourId,
          tourName: item.tourName,
          price: parseFloat(item.tourPrice),
          purchaseDate: purchaseToken.purchaseDate
        });
      }

      // Clear the cart
      await OrderItem.destroy({
        where: { shoppingCartId: cart.id },
        transaction
      });

      await ShoppingCart.update({
        totalPrice: 0.00,
        totalItems: 0
      }, {
        where: { id: cart.id },
        transaction
      });

      await transaction.commit();

      return {
        success: true,
        purchaseTokens,
        totalAmount: cart.totalPrice,
        purchaseDate: new Date(),
        message: `Uspešno ste kupili ${purchaseTokens.length} turu/tura`
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Checkout error:', error);
      throw error;
    }
  }

  // Validate purchase token
  static async validatePurchaseToken(userId, tourId) {
    try {
      const purchaseToken = await TourPurchaseToken.findOne({
        where: {
          userId,
          tourId,
          isActive: true,
          status: 'completed'
        },
        include: [{
          model: Tour,
          as: 'tour'
        }]
      });

      if (!purchaseToken) {
        return {
          valid: false,
          message: 'Nemate valjazan purchase token za ovu turu'
        };
      }

      // Check if token is expired (if expiry date is set)
      if (purchaseToken.expiryDate && new Date() > purchaseToken.expiryDate) {
        return {
          valid: false,
          message: 'Purchase token je istekao'
        };
      }

      return {
        valid: true,
        token: purchaseToken.purchaseToken,
        purchaseDate: purchaseToken.purchaseDate,
        tour: purchaseToken.tour
      };
    } catch (error) {
      console.error('Error validating purchase token:', error);
      throw error;
    }
  }

  // Get purchase history for user
  static async getPurchaseHistory(userId) {
    try {
      const purchases = await TourPurchaseToken.findAll({
        where: {
          userId,
          isActive: true
        },
        include: [{
          model: Tour,
          as: 'tour'
        }],
        order: [['purchaseDate', 'DESC']]
      });

      // Get all completed tour executions for this user
      const completedExecutions = await TourExecution.findAll({
        where: {
          userId,
          status: 'completed'
        },
        attributes: ['tourId', 'endTime']
      });

      const completedTourIds = new Set(completedExecutions.map(exec => exec.tourId));

      return purchases.map(purchase => ({
        id: purchase.id,
        purchaseToken: purchase.purchaseToken,
        status: purchase.status,
        purchasePrice: parseFloat(purchase.purchasePrice),
        purchaseDate: purchase.purchaseDate,
        expiryDate: purchase.expiryDate,
        isCompleted: completedTourIds.has(purchase.tourId),
        completedAt: completedExecutions.find(exec => exec.tourId === purchase.tourId)?.endTime || null,
        tour: {
          id: purchase.tour.id,
          name: purchase.tour.name,
          description: purchase.tour.description,
          status: purchase.tour.status,
          images: purchase.tour.images || []
        }
      }));
    } catch (error) {
      console.error('Error getting purchase history:', error);
      throw error;
    }
  }

  // Get checkout summary before processing
  static async getCheckoutSummary(userId) {
    try {
      const cart = await ShoppingCart.findOne({
        where: { userId, isActive: true },
        include: [{
          model: OrderItem,
          as: 'items',
          include: [{
            model: Tour,
            as: 'tour'
          }]
        }]
      });

      if (!cart || !cart.items || cart.items.length === 0) {
        return {
          isEmpty: true,
          message: 'Korpa je prazna'
        };
      }

      // Calculate totals and validate items
      let totalAmount = 0;
      const validItems = [];
      const invalidItems = [];

      for (const item of cart.items) {
        const currentTour = await Tour.findByPk(item.tourId);
        
        if (!currentTour || currentTour.status !== 'published') {
          invalidItems.push({
            tourName: item.tourName,
            reason: 'Tura vise nije dostupna'
          });
          continue;
        }

        if (parseFloat(currentTour.price) !== parseFloat(item.tourPrice)) {
          invalidItems.push({
            tourName: item.tourName,
            reason: 'Cena se promenila',
            oldPrice: parseFloat(item.tourPrice),
            newPrice: parseFloat(currentTour.price)
          });
          continue;
        }

        validItems.push({
          tourId: item.tourId,
          tourName: item.tourName,
          price: parseFloat(item.tourPrice),
          subtotal: parseFloat(item.subtotal)
        });

        totalAmount += parseFloat(item.subtotal);
      }

      return {
        isEmpty: false,
        totalItems: validItems.length,
        totalAmount,
        validItems,
        invalidItems,
        hasInvalidItems: invalidItems.length > 0,
        canProceed: validItems.length > 0 && invalidItems.length === 0
      };
    } catch (error) {
      console.error('Error getting checkout summary:', error);
      throw error;
    }
  }
}

module.exports = CheckoutService;