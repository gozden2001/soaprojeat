const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TourPurchaseToken = sequelize.define('TourPurchaseToken', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID korisnika koji je kupio turu'
    },
    tourId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tours',
        key: 'id'
      },
      comment: 'ID kupljene ture'
    },
    purchaseToken: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      comment: 'Jedinstveni token za kupljenu turu'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'expired'),
      defaultValue: 'pending',
      allowNull: false,
      comment: 'Status purchase token-a'
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Cena po kojoj je tura kupljena'
    },
    purchaseDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      comment: 'Datum i vreme kupovine'
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datum isteka token-a (opciono)'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'Da li je token aktivan'
    }
  }, {
    tableName: 'TourPurchaseTokens',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['userId'],
        name: 'idx_tour_purchase_tokens_user_id'
      },
      {
        fields: ['tourId'],
        name: 'idx_tour_purchase_tokens_tour_id'
      },
      {
        fields: ['purchaseToken'],
        unique: true,
        name: 'idx_tour_purchase_tokens_token'
      },
      {
        fields: ['userId', 'tourId'],
        name: 'idx_tour_purchase_tokens_user_tour'
      }
    ]
  });

  TourPurchaseToken.associate = function(models) {
    // TourPurchaseToken belongs to Tour
    TourPurchaseToken.belongsTo(models.Tour, {
      foreignKey: 'tourId',
      as: 'tour'
    });
  };

  return TourPurchaseToken;
};