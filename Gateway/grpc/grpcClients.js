const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const TOUR_PROTO_PATH = path.join(__dirname, '../protos/tour.proto');

const tourPackageDefinition = protoLoader.loadSync(TOUR_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const tourProto = grpc.loadPackageDefinition(tourPackageDefinition).tour;

const tourClient = new tourProto.TourService(
  process.env.TOUR_GRPC_URL || 'tour-service:50052',
  grpc.credentials.createInsecure()
);

class GrpcClients {
  static createTour(tourData, authorId) {
    return new Promise((resolve, reject) => {
      const request = {
        name: tourData.name,
        description: tourData.description,
        tags: tourData.tags || [],
        authorId,
        price: tourData.price || 0,
        category: tourData.category || 'other',
        difficulty: tourData.difficulty || 'medium',
        estimatedDurationMinutes: tourData.estimatedDurationMinutes || 60
      };

      tourClient.createTour(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  static deleteKeyPoint(keyPointId, userId) {
    return new Promise((resolve, reject) => {
      const request = {
        keyPointId,
        userId
      };

      tourClient.deleteKeyPoint(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}

module.exports = GrpcClients;
