import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText)
  gsap.defaults({ ease: 'power2.out', duration: 0.7 })

  return {
    provide: { gsap },
  }
})
