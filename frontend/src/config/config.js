import { Icon, Style, Stroke, Fill } from 'ol/style'

export const defaultConfig = {
  baseURL: 'http://localhost:3000/api',
  mapZoom: 13.5,
  mapLocation: [19.823182951442245, 45.23942501835891], // Novi Sad
  mapProjection: 'EPSG:3857',
  
  // Key point marker style
  keyPointMarkerStyle: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      scale: 0.8,
      src: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#2196F3" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `)
    })
  }),
  
  // Selected key point marker style
  selectedKeyPointMarkerStyle: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      scale: 1.0,
      src: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#FF5722" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `)
    })
  }),
  
  // Temporary click marker style
  tempMarkerStyle: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      scale: 0.9,
      src: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#4CAF50" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `)
    })
  }),
  
  // Key point radius circle style
  keyPointRadiusStyle: new Style({
    stroke: new Stroke({
      color: 'rgba(33, 150, 243, 0.6)',
      width: 2,
      lineDash: [5, 5]
    }),
    fill: new Fill({
      color: 'rgba(33, 150, 243, 0.1)'
    })
  })
}