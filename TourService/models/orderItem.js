const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    shoppingCartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ShoppingCarts',
        key: 'id'
      },
      comment: 'ID korpe kojoj pripada stavka'
    },
    tourId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tours',
        key: 'id'
      },
      comment: 'ID ture'
    },
    tourName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Naziv ture (sačuvan za slučaj da se tura obriše)'
    },
    tourPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Cena ture u vreme dodavanja u korpu'
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      comment: 'Količina (obično 1 za ture)'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Ukupna cena za ovu stavku (tourPrice * quantity)'
    }
  }, {
    tableName: 'OrderItems',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['shoppingCartId'],
        name: 'idx_order_items_cart_id'
      },
      {
        fields: ['tourId'],
        name: 'idx_order_items_tour_id'
      },
      {
        fields: ['shoppingCartId', 'tourId'],
        unique: true,
        name: 'idx_order_items_cart_tour'
      }
    ]
  });

  OrderItem.associate = function(models) {
    // OrderItem belongs to ShoppingCart
    OrderItem.belongsTo(models.ShoppingCart, {
      foreignKey: 'shoppingCartId',
      as: 'cart'
    });

    // OrderItem belongs to Tour
    OrderItem.belongsTo(models.Tour, {
      foreignKey: 'tourId',
      as: 'tour'
    });
  };

  return OrderItem;
};