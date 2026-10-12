export const metadata = {
  title: 'Interactive Portfolio',
};

export default function PortfolioPage() {
  return (
    <iframe
      title="Interactive portfolio"
      src="/portfolio-game/index.html"
      allow="fullscreen"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 0,
        zIndex: 9999,
        background: '#000',
      }}
    />
  );
}
