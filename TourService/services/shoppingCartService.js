const { ShoppingCart, OrderItem, Tour, TourPurchaseToken } = require('../models');
const { Op } = require('sequelize');

class ShoppingCartService {

  // Get or create shopping cart for user
  static async getOrCreateCart(userId) {
    try {
      let cart = await ShoppingCart.findOne({
        where: { userId, isActive: true },
        include: [{
          model: OrderItem,
          as: 'items',
          include: [{
            model: Tour,
            as: 'tour',
            attributes: ['id', 'name', 'description', 'price', 'status', 'images']
          }]
        }]
      });

      if (!cart) {
        cart = await ShoppingCart.create({
          userId,
          totalPrice: 0.00,
          totalItems: 0,
          isActive: true
        });
        
        // Fetch again with includes
        cart = await ShoppingCart.findByPk(cart.id, {
          include: [{
            model: OrderItem,
            as: 'items',
            include: [{
              model: Tour,
              as: 'tour',
              attributes: ['id', 'name', 'description', 'price', 'status', 'images']
            }]
          }]
        });
      }

      return cart;
    } catch (error) {
      console.error('Error getting/creating cart:', error);
      throw error;
    }
  }

  // Add tour to cart
  static async addToCart(userId, tourId) {
    try {
      // Check if tour exists and is published
      const tour = await Tour.findByPk(tourId);
      if (!tour) {
        throw new Error('Tura ne postoji');
      }

      if (tour.status !== 'published') {
        throw new Error('Tura mora biti objavljena da bi mogla da se kupi');
      }

      if (tour.price <= 0) {
        throw new Error('Tura mora imati definisanu cenu');
      }

      // Check if user already purchased this tour
      const existingPurchase = await TourPurchaseToken.findOne({
        where: {
          userId,
          tourId,
          isActive: true
        }
      });

      if (existingPurchase) {
        throw new Error('Vec ste kupili ovu turu');
      }

      // Get or create cart
      const cart = await this.getOrCreateCart(userId);

      // Check if tour is already in cart
      const existingItem = await OrderItem.findOne({
        where: {
          shoppingCartId: cart.id,
          tourId
        }
      });

      if (existingItem) {
        throw new Error('Tura je vec u korpi');
      }

      // Add tour to cart
      const orderItem = await OrderItem.create({
        shoppingCartId: cart.id,
        tourId,
        tourName: tour.name,
        tourPrice: tour.price,
        quantity: 1,
        subtotal: tour.price
      });

      // Update cart totals
      await this.updateCartTotals(cart.id);

      // Return updated cart
      return await this.getOrCreateCart(userId);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Remove tour from cart
  static async removeFromCart(userId, tourId) {
    try {
      const cart = await this.getOrCreateCart(userId);

      const orderItem = await OrderItem.findOne({
        where: {
          shoppingCartId: cart.id,
          tourId
        }
      });

      if (!orderItem) {
        throw new Error('Tura nije u korpi');
      }

      await orderItem.destroy();

      // Update cart totals
      await this.updateCartTotals(cart.id);

      // Return updated cart
      return await this.getOrCreateCart(userId);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Update cart totals
  static async updateCartTotals(cartId) {
    try {
      const items = await OrderItem.findAll({
        where: { shoppingCartId: cartId }
      });

      const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
      const totalItems = items.length;

      await ShoppingCart.update({
        totalPrice,
        totalItems
      }, {
        where: { id: cartId }
      });

      return { totalPrice, totalItems };
    } catch (error) {
      console.error('Error updating cart totals:', error);
      throw error;
    }
  }

  // Clear cart
  static async clearCart(userId) {
    try {
      const cart = await this.getOrCreateCart(userId);

      await OrderItem.destroy({
        where: { shoppingCartId: cart.id }
      });

      await ShoppingCart.update({
        totalPrice: 0.00,
        totalItems: 0
      }, {
        where: { id: cart.id }
      });

      return await this.getOrCreateCart(userId);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Get cart summary
  static async getCartSummary(userId) {
    try {
      const cart = await this.getOrCreateCart(userId);
      
      return {
        cartId: cart.id,
        totalItems: cart.totalItems,
        totalPrice: parseFloat(cart.totalPrice),
        items: cart.items?.map(item => ({
          id: item.id,
          tourId: item.tourId,
          tourName: item.tourName,
          tourPrice: parseFloat(item.tourPrice),
          quantity: item.quantity,
          subtotal: parseFloat(item.subtotal),
          tour: item.tour ? {
            id: item.tour.id,
            name: item.tour.name,
            description: item.tour.description,
            price: parseFloat(item.tour.price),
            status: item.tour.status,
            images: item.tour.images || []
          } : null
        })) || []
      };
    } catch (error) {
      console.error('Error getting cart summary:', error);
      throw error;
    }
  }

  // Check if user owns a tour (has purchase token)
  static async checkTourOwnership(userId, tourId) {
    try {
      const purchaseToken = await TourPurchaseToken.findOne({
        where: {
          userId,
          tourId,
          isActive: true,
          status: { [Op.in]: ['pending', 'completed'] }
        }
      });

      return !!purchaseToken;
    } catch (error) {
      console.error('Error checking tour ownership:', error);
      return false;
    }
  }

  // Get user's purchased tours
  static async getUserPurchasedTours(userId) {
    try {
      const purchaseTokens = await TourPurchaseToken.findAll({
        where: {
          userId,
          isActive: true,
          status: { [Op.in]: ['pending', 'completed'] }
        },
        include: [{
          model: Tour,
          as: 'tour'
        }],
        order: [['purchaseDate', 'DESC']]
      });

      return purchaseTokens.map(token => ({
        purchaseToken: token.purchaseToken,
        purchasePrice: parseFloat(token.purchasePrice),
        purchaseDate: token.purchaseDate,
        status: token.status,
        tour: token.tour
      }));
    } catch (error) {
      console.error('Error getting purchased tours:', error);
      throw error;
    }
  }
}

module.exports = ShoppingCartService;