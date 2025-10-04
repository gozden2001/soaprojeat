const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ShoppingCart = sequelize.define('ShoppingCart', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: 'ID korisnika - jedan korisnik ima jednu korpu'
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
      comment: 'Ukupna cena svih stavki u korpi'
    },
    totalItems: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Ukupan broj stavki u korpi'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'Da li je korpa aktivna'
    }
  }, {
    tableName: 'ShoppingCarts',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['userId'],
        unique: true,
        name: 'idx_shopping_carts_user_id'
      }
    ]
  });

  ShoppingCart.associate = function(models) {
    // ShoppingCart has many order items
    ShoppingCart.hasMany(models.OrderItem, {
      foreignKey: 'shoppingCartId',
      as: 'items',
      onDelete: 'CASCADE'
    });
  };

  return ShoppingCart;
};