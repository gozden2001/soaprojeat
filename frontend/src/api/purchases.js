import axiosInstance from '../utils/axiosInstance'

const purchasesAPI = {
  // Get user's purchase history
  async getPurchases() {
    try {
      const response = await axiosInstance.get('/api/cart/purchases')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Get purchases error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Greška pri učitavanju kupljenih tura'
      }
    }
  },

  // Check if user owns a specific tour
  async checkTourOwnership(tourId) {
    try {
      const response = await axiosInstance.get(`/api/cart/purchases/check/${tourId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Check ownership error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Greška pri proveri vlasništva ture'
      }
    }
  },

  // Validate purchase token for tour execution
  async validatePurchaseToken(tourId) {
    try {
      const response = await axiosInstance.get(`/api/cart/validate/${tourId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Validate token error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Greška pri validaciji tokena'
      }
    }
  }
}

export default purchasesAPI