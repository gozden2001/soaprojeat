const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const tourService = require('../services/tourService');
const tourKeyPointService = require('../services/tourKeyPointService');

const PROTO_PATH = path.join(__dirname, '../protos/tour.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const tourProto = grpc.loadPackageDefinition(packageDefinition).tour;

class TourGrpcService {
  static async createTour(call, callback) {
    try {
      console.log('[gRPC] createTour called with:', JSON.stringify(call.request, null, 2));
      
      const { name, description, tags, authorId, price, category, difficulty, estimatedDurationMinutes } = call.request;
      
      const tourData = {
        name,
        description,
        tags: tags || [],
        price: price || 0,
        category: category || 'other',
        difficulty: difficulty || 'medium',
        estimatedDurationMinutes: estimatedDurationMinutes || 60
      };


      const author = {
        id: authorId,
        username: `user${authorId}` 
      };

      const result = await tourService.createTour(tourData, author);
      
      if (result.success) {
        callback(null, {
          success: true,
          message: 'Tour created successfully',
          tourId: result.data.id,
          status: result.data.status
        });
      } else {
        callback(null, {
          success: false,
          message: result.error || 'Failed to create tour',
          tourId: 0,
          status: 'error'
        });
      }
    } catch (error) {
      console.error('gRPC createTour error:', error);
      callback(null, {
        success: false,
        message: error.message || 'Failed to create tour',
        tourId: 0,
        status: 'error'
      });
    }
  }

  static async deleteKeyPoint(call, callback) {
    try {
      console.log('[gRPC] deleteKeyPoint called with:', JSON.stringify(call.request, null, 2));
      
      const { keyPointId, userId } = call.request;
      
      await tourKeyPointService.deleteKeyPoint(keyPointId, userId);
      
      callback(null, {
        success: true,
        message: 'Key point deleted successfully'
      });
    } catch (error) {
      console.error('gRPC deleteKeyPoint error:', error);
      
      let grpcError;
      if (error.message.includes('not found')) {
        grpcError = {
          code: grpc.status.NOT_FOUND,
          message: 'Key point not found'
        };
      } else if (error.message.includes('permission') || error.message.includes('access')) {
        grpcError = {
          code: grpc.status.PERMISSION_DENIED,
          message: 'You do not have permission to delete this key point'
        };
      } else {
        grpcError = {
          code: grpc.status.INTERNAL,
          message: 'Internal server error'
        };
      }
      
      callback(grpcError);
    }
  }
}

function startGrpcServer() {
  const server = new grpc.Server();
  
  server.addService(tourProto.TourService.service, {
    createTour: TourGrpcService.createTour,
    deleteKeyPoint: TourGrpcService.deleteKeyPoint
  });

  const port = process.env.GRPC_PORT || 50052;
  const bindAddress = `0.0.0.0:${port}`;
  
  server.bindAsync(bindAddress, grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
      console.error('gRPC Server failed to bind:', error);
      return;
    }

    console.log(`gRPC Server running on port ${port}`);
    server.start();
  });
}

module.exports = {
  startGrpcServer
};
