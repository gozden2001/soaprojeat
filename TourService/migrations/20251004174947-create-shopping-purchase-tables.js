'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ShoppingCarts table
    await queryInterface.createTable('ShoppingCarts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        comment: 'ID korisnika - jedan korisnik ima jednu korpu'
      },
      totalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false,
        comment: 'Ukupna cena svih stavki u korpi'
      },
      totalItems: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Ukupan broj stavki u korpi'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Da li je korpa aktivna'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create OrderItems table
    await queryInterface.createTable('OrderItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      shoppingCartId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ShoppingCarts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID korpe kojoj pripada stavka'
      },
      tourId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tours',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'ID ture'
      },
      tourName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Naziv ture (sačuvan za slučaj da se tura obriše)'
      },
      tourPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Cena ture u vreme dodavanja u korpu'
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false,
        comment: 'Količina (obično 1 za ture)'
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Ukupna cena za ovu stavku (tourPrice * quantity)'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create TourPurchaseTokens table
    await queryInterface.createTable('TourPurchaseTokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID korisnika koji je kupio turu'
      },
      tourId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tours',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID kupljene ture'
      },
      purchaseToken: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
        comment: 'Jedinstveni token za kupljenu turu'
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'expired'),
        defaultValue: 'pending',
        allowNull: false,
        comment: 'Status purchase token-a'
      },
      purchasePrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Cena po kojoj je tura kupljena'
      },
      purchaseDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
        comment: 'Datum i vreme kupovine'
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Datum isteka token-a (opciono)'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Da li je token aktivan'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('ShoppingCarts', ['userId'], {
      unique: true,
      name: 'idx_shopping_carts_user_id'
    });

    await queryInterface.addIndex('OrderItems', ['shoppingCartId'], {
      name: 'idx_order_items_cart_id'
    });

    await queryInterface.addIndex('OrderItems', ['tourId'], {
      name: 'idx_order_items_tour_id'
    });

    await queryInterface.addIndex('OrderItems', ['shoppingCartId', 'tourId'], {
      unique: true,
      name: 'idx_order_items_cart_tour'
    });

    await queryInterface.addIndex('TourPurchaseTokens', ['userId'], {
      name: 'idx_tour_purchase_tokens_user_id'
    });

    await queryInterface.addIndex('TourPurchaseTokens', ['tourId'], {
      name: 'idx_tour_purchase_tokens_tour_id'
    });

    await queryInterface.addIndex('TourPurchaseTokens', ['purchaseToken'], {
      unique: true,
      name: 'idx_tour_purchase_tokens_token'
    });

    await queryInterface.addIndex('TourPurchaseTokens', ['userId', 'tourId'], {
      name: 'idx_tour_purchase_tokens_user_tour'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TourPurchaseTokens');
    await queryInterface.dropTable('OrderItems');
    await queryInterface.dropTable('ShoppingCarts');
  }
};
