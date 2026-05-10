import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
  /** max-w-6xl por defecto; narrow usa max-w-3xl */
  size?: 'default' | 'narrow' | 'wide';
};

const maxMap = {
  default: 'max-w-6xl',
  narrow: 'max-w-3xl',
  wide: 'max-w-7xl',
};

export function PageContainer({ children, className, size = 'default' }: Props) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', maxMap[size], className)}>
      {children}
    </div>
  );
}
