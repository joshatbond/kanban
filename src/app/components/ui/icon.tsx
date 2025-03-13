import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentProps } from 'react'

import { cn } from '../../lib/cn'
import iconsHref from './icons.svg?url'

export const iconVariants = cva('inline self-center', {
  variants: {
    size: {
      default: 'size-4',
      xl: 'size-8',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export function Icon({
  className,
  name,
  size,
  spin = false,
  ...props
}: ComponentProps<'svg'> &
  VariantProps<typeof iconVariants> & {
    spin?: boolean
    /** names are based on the sprite ids from `icons.svg` */
    name:
      | 'bars'
      | 'github'
      | 'mail'
      | 'login'
      | 'logout'
      | 'pin'
      | 'plus'
      | 'spin'
      | 'trash'
  }) {
  return (
    <svg
      className={cn(
        iconVariants({ size, className }),
        spin ? 'animate-spin' : ''
      )}
      {...props}
    >
      <use href={`${iconsHref}#${name}`} />
    </svg>
  )
}
