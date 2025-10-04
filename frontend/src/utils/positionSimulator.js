/**
 * Position Simulator - simulira kretanje duž ture sa realnim koordinatama
 */
class PositionSimulator {
  constructor() {
    this.isRunning = false
    this.currentIndex = 0
    this.route = []
    this.interval = null
    this.callbacks = []
    this.updateInterval = 10000 // 10 sekundi
    this.speed = 50 // metara po update-u (emulirano kretanje)
  }

  /**
   * Generiše rutu između ključnih tačaka ture
   */
  generateRoute(keyPoints, startLat = null, startLng = null) {
    this.route = []
    
    // Ako nema početne pozicije, koristi prvu ključnu tačku
    if (!startLat || !startLng) {
      if (keyPoints.length > 0) {
        startLat = keyPoints[0].latitude
        startLng = keyPoints[0].longitude
      } else {
        // Default pozicija (centar Novi Sad)
        startLat = 45.2671
        startLng = 19.8335
      }
    }

    this.route.push({ latitude: startLat, longitude: startLng, type: 'start' })

    // Dodaj sve ključne tačke
    keyPoints.forEach((point, index) => {
      this.route.push({
        latitude: point.latitude,
        longitude: point.longitude,
        type: 'keypoint',
        keypointId: point.id,
        name: point.name,
        description: point.description,
        index: index
      })
    })

    console.log('Generated route:', this.route)
  }

  /**
   * Pokreće simulaciju kretanja
   */
  start() {
    if (this.isRunning || this.route.length === 0) return

    this.isRunning = true
    this.currentIndex = 0

    console.log('Position Simulator started')
    
    // Pošalji početnu poziciju
    this.emitPosition()

    // Pokreni interval
    this.interval = setInterval(() => {
      this.nextPosition()
    }, this.updateInterval)
  }

  /**
   * Zaustavlja simulaciju
   */
  stop() {
    this.isRunning = false
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    console.log('Position Simulator stopped')
  }

  /**
   * Prelazi na sledeću poziciju u ruti
   */
  nextPosition() {
    if (!this.isRunning) return

    // Ako smo na kraju rute, završi simulaciju
    if (this.currentIndex >= this.route.length - 1) {
      console.log('Route completed')
      this.stop()
      return
    }

    this.currentIndex++
    this.emitPosition()
  }

  /**
   * Dobija trenutnu poziciju
   */
  getCurrentPosition() {
    if (this.currentIndex < this.route.length) {
      return this.route[this.currentIndex]
    }
    return null
  }

  /**
   * Emituje trenutnu poziciju svim callback funkcijama
   */
  emitPosition() {
    const position = this.getCurrentPosition()
    if (position) {
      console.log(`Position update: ${position.latitude}, ${position.longitude}`)
      this.callbacks.forEach(callback => {
        try {
          callback(position)
        } catch (error) {
          console.error('Position callback error:', error)
        }
      })
    }
  }

  /**
   * Dodaje callback funkciju za primanje pozicija
   */
  onPositionUpdate(callback) {
    this.callbacks.push(callback)
  }

  /**
   * Uklanja callback funkciju
   */
  removePositionListener(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback)
  }

  /**
   * Proverava da li je trenutna pozicija blizu ključne tačke
   */
  checkProximityToKeyPoint(targetLat, targetLng, radius = 50) {
    const currentPos = this.getCurrentPosition()
    if (!currentPos) return false

    const distance = this.calculateDistance(
      currentPos.latitude,
      currentPos.longitude,
      targetLat,
      targetLng
    )

    return distance <= radius
  }

  /**
   * Haversine formula za računanje udaljenosti između dve tačke
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000 // Radius Zemlje u metrima
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    
    return R * c // Udaljenost u metrima
  }

  /**
   * Konvertuje stepene u radijane
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  /**
   * Postavlja brzinu simulacije (interval između update-ova)
   */
  setUpdateInterval(milliseconds) {
    this.updateInterval = milliseconds
    
    // Ako je simulacija pokrenuta, restartuj interval
    if (this.isRunning) {
      this.stop()
      setTimeout(() => this.start(), 100)
    }
  }

  /**
   * Dobija informacije o trenutnom stanju simulacije
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentIndex: this.currentIndex,
      totalPoints: this.route.length,
      currentPosition: this.getCurrentPosition(),
      progress: this.route.length > 0 ? (this.currentIndex / (this.route.length - 1)) * 100 : 0
    }
  }

  /**
   * Skoči na specifičnu poziciju u ruti (za testiranje)
   */
  jumpToPosition(index) {
    if (index >= 0 && index < this.route.length) {
      this.currentIndex = index
      this.emitPosition()
    }
  }

  /**
   * Resetuje simulator na početak
   */
  reset() {
    this.stop()
    this.currentIndex = 0
    this.callbacks = []
    this.route = []
  }
}

// Singleton instance
const positionSimulator = new PositionSimulator()

export default positionSimulator