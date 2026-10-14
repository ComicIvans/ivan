// The plugin ships no TypeScript types; this mirrors its documented API
// (https://github.com/dimsemenov/photoswipe-dynamic-caption-plugin).
declare module 'photoswipe-dynamic-caption-plugin' {
  import type PhotoSwipeLightbox from 'photoswipe/lightbox'
  import type { SlideData } from 'photoswipe'

  export interface DynamicCaptionSlide {
    data: SlideData
    index: number
  }

  export interface PhotoSwipeDynamicCaptionOptions {
    /** Selector for caption content, or a function returning the caption HTML. */
    captionContent?: string | ((slide: DynamicCaptionSlide) => string)
    type?: 'auto' | 'below' | 'aside'
    horizontalEdgeThreshold?: number
    mobileCaptionOverlapRatio?: number
    mobileLayoutBreakpoint?: number | ((pswp: unknown, plugin: unknown) => boolean)
    verticallyCenterImage?: boolean
  }

  export default class PhotoSwipeDynamicCaption {
    constructor(lightbox: PhotoSwipeLightbox, options?: PhotoSwipeDynamicCaptionOptions)
    options: PhotoSwipeDynamicCaptionOptions
    lightbox: PhotoSwipeLightbox
  }
}

declare module 'photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css'
