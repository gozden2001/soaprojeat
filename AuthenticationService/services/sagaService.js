// services/sagaService.js
const { User } = require('../models');
const axios = require('axios');

class SagaService {
  
  /**
   * SAGA: Update username across microservices
   * Step 1: Update username in AuthService (PostgreSQL)  
   * Step 2: Update assigneeUsername in ComplaintsService (Elasticsearch)
   * Step 3: Compensating actions on failure
   */
  async updateUsername(userId, newUsername) {
    let oldUsername = null;
    let authUpdated = false;
    let complaintsUpdated = false;

    try {
      // Step 1: Get current username and update in PostgreSQL
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      oldUsername = user.username;
      
      // Check if new username is available
      const existingUser = await User.findOne({ where: { username: newUsername } });
      if (existingUser && existingUser.id !== userId) {
        throw new Error(`Username '${newUsername}' is already taken`);
      }

      // Update username in PostgreSQL
      await user.update({ username: newUsername });
      authUpdated = true;
      
      console.log(`[SAGA] Step 1: Updated username in AuthService: ${oldUsername} → ${newUsername}`);

      // Step 2: Update assigneeUsername in ComplaintsService
      const complaintsResponse = await axios.put('http://complaints-service:3002/api/internal/update-assignee-username', {
        assigneeId: userId,
        oldUsername: oldUsername,
        newUsername: newUsername
      });

      complaintsUpdated = true;
      console.log(`[SAGA] Step 2: Updated assigneeUsername in ComplaintsService`);

      return {
        success: true,
        message: `Username successfully updated from '${oldUsername}' to '${newUsername}'`,
        userId: userId,
        oldUsername: oldUsername,
        newUsername: newUsername
      };

    } catch (error) {
      console.error(`[SAGA] Error during username update:`, error.message);

      // Compensating Actions (Rollback)
      try {
        if (complaintsUpdated) {
          // Rollback ComplaintsService
          await axios.put('http://complaints-service:3002/api/internal/update-assignee-username', {
            assigneeId: userId,
            oldUsername: newUsername,
            newUsername: oldUsername
          });
          console.log(`[SAGA] Rollback: Reverted ComplaintsService changes`);
        }

        if (authUpdated && oldUsername) {
          // Rollback AuthService
          const user = await User.findByPk(userId);
          await user.update({ username: oldUsername });
          console.log(`[SAGA] Rollback: Reverted AuthService changes`);
        }
      } catch (rollbackError) {
        console.error(`[SAGA] Rollback failed:`, rollbackError.message);
      }

      throw new Error(`SAGA transaction failed: ${error.message}`);
    }
  }
}

module.exports = new SagaService();