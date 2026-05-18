import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function Section({ children, className, id }: Props) {
  return (
    <section id={id} className={cn('py-16 sm:py-20 lg:py-24', className)}>
      {children}
    </section>
  );
}
