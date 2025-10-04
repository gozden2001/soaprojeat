const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TourExecution = sequelize.define('TourExecution', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID korisnika koji izvršava turu'
    },
    tourId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID ture koja se izvršava'
    },
    purchaseTokenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID purchase token-a (obavezno za kupljene ture)'
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'abandoned'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Status izvršavanja ture'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Vreme početka izvršavanja ture'
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Vreme završetka izvršavanja ture'
    },
    lastActivity: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Poslednja aktivnost (update pozicije)'
    },
    startLatitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      comment: 'Početna geografska širina'
    },
    startLongitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      comment: 'Početna geografska dužina'
    },
    currentLatitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      comment: 'Trenutna geografska širina'
    },
    currentLongitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      comment: 'Trenutna geografska dužina'
    },
    completedKeyPoints: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Lista ID-jeva kompletiranih ključnih tačaka sa vremenima'
    },
    totalDistance: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Ukupna pređena distanca u metrima'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Napomene o izvršavanju ture'
    }
  }, {
    tableName: 'tour_executions',
    underscored: false,
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['tourId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['startTime']
      },
      {
        unique: true,
        fields: ['userId', 'tourId', 'startTime'],
        name: 'unique_active_execution'
      }
    ]
  });

  TourExecution.associate = function(models) {
    // Association with Tour
    TourExecution.belongsTo(models.Tour, {
      foreignKey: 'tourId',
      as: 'tour'
    });

    // Association with TourPurchaseToken
    TourExecution.belongsTo(models.TourPurchaseToken, {
      foreignKey: 'purchaseTokenId',
      as: 'purchaseToken'
    });

    // Note: User association is handled via purchaseToken.user
    // since User model is in AuthenticationService
  };

  // Instance methods
  TourExecution.prototype.updateLastActivity = function() {
    this.lastActivity = new Date();
    return this.save();
  };

  TourExecution.prototype.updatePosition = function(latitude, longitude) {
    this.currentLatitude = latitude;
    this.currentLongitude = longitude;
    this.lastActivity = new Date();
    return this.save();
  };

  TourExecution.prototype.addCompletedKeyPoint = function(keyPointId) {
    const completedKeyPoints = this.completedKeyPoints || [];
    const existingIndex = completedKeyPoints.findIndex(kp => kp.keyPointId === keyPointId);
    
    if (existingIndex === -1) {
      completedKeyPoints.push({
        keyPointId: keyPointId,
        completedAt: new Date().toISOString()
      });
      this.completedKeyPoints = completedKeyPoints;
      this.lastActivity = new Date();
      return this.save();
    }
    
    return Promise.resolve(this);
  };

  TourExecution.prototype.finish = function(status = 'completed', notes = null) {
    this.status = status;
    this.endTime = new Date();
    if (notes) {
      this.notes = notes;
    }
    return this.save();
  };

  TourExecution.prototype.getDuration = function() {
    const end = this.endTime || new Date();
    return Math.floor((end - this.startTime) / 1000); // Duration in seconds
  };

  TourExecution.prototype.getCompletedKeyPointsCount = function() {
    return (this.completedKeyPoints || []).length;
  };

  return TourExecution;
};