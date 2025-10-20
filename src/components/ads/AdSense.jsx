'use client'
import { useEffect, useRef, useMemo, useState } from 'react'

export default function AdSense({ 
  adSlot, 
  adFormat = "auto", 
  fullWidthResponsive = true, 
  style = { display: 'block' },
  className = ""
}) {
  const adRef = useRef(null)
  const initialized = useRef(false)
  const [hasError, setHasError] = useState(false)
  
  // Generate unique ID for each ad instance
  const adId = useMemo(() => `ad-${adSlot}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, [adSlot])

  // Development mode fallback
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    // Skip initialization if already done or in error state
    if (initialized.current || hasError) return

    const initAd = () => {
      if (!adRef.current || initialized.current) return
      
      try {
        // Check if AdSense script is loaded
        if (!window.adsbygoogle) {
          console.warn('AdSense script not loaded yet for slot:', adSlot)
          return
        }

        // Check if this ad has already been processed
        if (adRef.current.dataset.adsbygoogleStatus) {
          console.log('Ad already processed for slot:', adSlot)
          return
        }

        // Initialize the ad
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        initialized.current = true
        console.log('AdSense ad initialized for slot:', adSlot)
        
      } catch (err) {
        console.error(`AdSense error for slot ${adSlot}:`, err)
        setHasError(true)
      }
    }

    // Add delay to prevent rapid initialization
    const timer = setTimeout(() => {
      if (window.adsbygoogle) {
        initAd()
      } else {
        // Wait for the script to load with exponential backoff
        let attempts = 0
        const maxAttempts = 20
        
        const checkAdSense = setInterval(() => {
          attempts++
          
          if (window.adsbygoogle) {
            clearInterval(checkAdSense)
            initAd()
          } else if (attempts >= maxAttempts) {
            clearInterval(checkAdSense)
            console.warn(`AdSense failed to load after ${maxAttempts} attempts for slot:`, adSlot)
            setHasError(true)
          }
        }, 200) // Check every 200ms
      }
    }, 100) // Initial delay

    return () => clearTimeout(timer)
  }, [adSlot, hasError])

  // Development mode placeholder
  if (isDevelopment) {
    return (
      <div className={`adsense-container ${className} bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-4 text-center`} id={adId}>
        <div className="text-gray-400 text-sm">
          📢 AdSense Placeholder<br />
          <span className="text-xs">Slot: {adSlot}</span><br />
          <span className="text-xs">Format: {adFormat}</span>
        </div>
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className={`adsense-container ${className}`} id={adId}>
        <div className="text-center text-xs text-gray-500 p-2">
          Ad unavailable
        </div>
      </div>
    )
  }

  return (
    <div className={`adsense-container ${className}`} id={adId}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-5338006842623882"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  )
}
