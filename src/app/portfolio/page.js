import { redirect } from 'next/navigation';

export const metadata = { title: 'Interactive Portfolio' };

export default function PortfolioPage() {
  redirect('/portfolio-game/index.html');
}
