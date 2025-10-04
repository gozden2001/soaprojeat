import axiosInstance from '../utils/axiosInstance'

const tourExecutionAPI = {
  // Start tour execution
  async startTour(tourId, startLatitude = null, startLongitude = null) {
    try {
      const response = await axiosInstance.post('/api/tour-execution/start', {
        tourId,
        startLatitude,
        startLongitude
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Start tour error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Greška pri pokretanju ture'
      }
    }
  },

  // Get active execution for tour
  async getActiveExecution(tourId) {
    try {
      const response = await axiosInstance.get(`/api/tour-execution/active/${tourId}`)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Get active execution error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Nema aktivne sesije za ovu turu'
      }
    }
  },

  // Update current position
  async updatePosition(executionId, latitude, longitude) {
    try {
      const response = await axiosInstance.patch(`/api/tour-execution/${executionId}/position`, {
        latitude,
        longitude
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Update position error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Greška pri ažuriranju pozicije'
      }
    }
  },

  // Check if near key points
  async checkKeyPoints(executionId, latitude, longitude, proximityRadius = 50) {
    try {
      const response = await axiosInstance.post(`/api/tour-execution/${executionId}/check-keypoints`, {
        latitude,
        longitude,
        proximityRadius
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Check key points error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Greška pri proveri ključnih tačaka'
      }
    }
  },

  // Finish tour execution
  async finishTour(executionId, status = 'completed', notes = null) {
    try {
      const response = await axiosInstance.patch(`/api/tour-execution/${executionId}/finish`, {
        status,
        notes
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Finish tour error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Greška pri završavanju ture'
      }
    }
  },

  // Get execution history
  async getExecutionHistory(page = 1, limit = 10) {
    try {
      const response = await axiosInstance.get('/api/tour-execution/history', {
        params: { page, limit }
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Get execution history error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Greška pri učitavanju istorije'
      }
    }
  },

  // Get execution statistics
  async getExecutionStats(executionId) {
    try {
      const response = await axiosInstance.get(`/api/tour-execution/${executionId}/stats`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Get execution stats error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Greška pri dobijanju statistika'
      }
    }
  }
}

export default tourExecutionAPI