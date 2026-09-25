import Image from 'next/image'
import { cn } from '@/shared/lib/cn'

export function LogoAyru({ claro, className, prioridad }: { claro?: boolean; className?: string; prioridad?: boolean }) {
  return (
    <Image
      src={claro ? '/brand/logo-ayru-claro.png' : '/brand/logo-ayru.png'}
      alt="AYRU Organic"
      width={381}
      height={238}
      priority={prioridad}
      className={cn('h-auto', className)}
    />
  )
}

export const SOPORTE = {
  whatsapp: '314 682 9261',
  whatsappUrl: 'https://wa.me/573146829261',
  instagram: '@ayruorganic_',
  instagramUrl: 'https://instagram.com/ayruorganic_',
  correo: 'ayruorganic@gmail.com',
} as const
