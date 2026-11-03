import Link from 'next/link';
import { blogPosts } from './blogData';

export const metadata = {
  title: 'DevOps Tutorials & Guides: Kubernetes, CI/CD, AWS',
  description: '49 free DevOps tutorials for 2026: Kubernetes in production, CI/CD, AWS, Terraform, backup and DevSecOps — in-depth guides from real project work.',
  keywords: 'devops tutorials, kubernetes tutorials, cicd guides, aws guides, terraform, devsecops, DevOps, Cloud Computing, Automation, Infrastructure',
  openGraph: {
    title: 'DevOps Tutorials & Guides: Kubernetes, CI/CD, AWS | DevOps Enginer',
    description: '49 free DevOps tutorials for 2026: Kubernetes in production, CI/CD, AWS, Terraform, backup and DevSecOps — in-depth guides from real project work.',
    type: 'website',
  }
};

const clusters = [
  { key: 'all', label: 'All Tutorials' },
  { key: 'kubernetes', label: 'Kubernetes' },
  { key: 'cicd', label: 'CI/CD & GitOps' },
  { key: 'cloud', label: 'AWS & Cloud' },
  { key: 'terraform', label: 'Terraform' },
  { key: 'security', label: 'Security' },
  { key: 'backup', label: 'Backup & Disaster Recovery' },
];

// Cluster membership is derived from each post's slug so new posts are
// classified automatically; anything unmatched appears under "All".
function clusterOf(slug = '') {
  const s = slug.toLowerCase();
  if (/(backup|restore|disaster)/.test(s)) return 'backup';
  if (/(terraform|pulumi)/.test(s)) return 'terraform';
  if (/(security|rbac|devsecops|network-policies|iam)/.test(s)) return 'security';
  if (/(cicd|github-actions|gitlab|jenkins|gitops|argo|monorepo)/.test(s)) return 'cicd';
  if (/(kubernetes|kubectl|helm)/.test(s)) return 'kubernetes';
  if (/(aws|eks|vpc|cloud|serverless|cost)/.test(s)) return 'cloud';
  return null;
}

const startHereCards = [
  {
    title: 'DevOps Roadmap',
    href: '/devops',
    text: 'The flagship path: prerequisites, infrastructure, containers, CI/CD, observability and security — in learning order.',
  },
  {
    title: 'Cloud Roadmap',
    href: '/cloud',
    text: 'AWS step by step — IAM, VPC, EKS and cost optimization — with Azure and GCP mapped beside it.',
  },
  {
    title: 'Cybersecurity Roadmap',
    href: '/cybersecurity',
    text: 'Fundamentals first, then offensive, defensive, cloud-security and governance tracks.',
  },
  {
    title: 'Kubernetes in Production — the Series',
    href: '/roadmaps#kubernetes-in-production',
    text: 'All 22 Kubernetes tutorials as one numbered sequence. Step 1 is the kubectl Commands Cheat Sheet.',
  },
];

const faqs = [
  {
    q: 'Are all the tutorials on DevOps Enginer free?',
    a: 'Yes — every tutorial on this page is free to read in full, with no signup wall. The roadmaps and the tutorials inside them are the free core of the site.',
  },
  {
    q: 'What order should I read the Kubernetes tutorials in?',
    a: 'In the Kubernetes in Production sequence: kubectl first, then resource requests and limits, networking and ingress, deployment strategies, and on through the production topics to backup and disaster recovery. The series card above links to the full numbered run.',
  },
  {
    q: 'How often are new tutorials published?',
    a: 'New tutorials are added regularly, and the newest always appear at the top of this page. The roadmap pages show which topics are coming next — anything marked Coming soon there is in the writing queue.',
  },
  {
    q: 'I am a beginner — where do I start?',
    a: 'With the DevOps roadmap, not with this list. It starts at the prerequisites (Linux, networking, Git, scripting) and sequences everything else after them, linking each step to its tutorial. Scrolling a 49-post index is for returning readers; the roadmap is for starting.',
  },
];

export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const requested = typeof params?.cluster === 'string' ? params.cluster : 'all';
  const active = clusters.some((c) => c.key === requested) ? requested : 'all';
  const visiblePosts = active === 'all'
    ? blogPosts
    : blogPosts.filter((post) => clusterOf(post.slug) === active);
  const activeLabel = clusters.find((c) => c.key === active)?.label;

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-black via-rich-black to-charcoal py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-6">
            DevOps <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-soft-gold">Tutorials &amp; Guides</span>
          </h1>
          <p className="text-xl text-warm-white/70 max-w-3xl mx-auto">
            49 in-depth, free tutorials. New here? Don&apos;t scroll — follow a roadmap and read them in order.
          </p>
        </div>

        {/* Start Here */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gold mb-6 text-center">Start Here — Follow a Roadmap</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {startHereCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="block bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20"
              >
                <h3 className="text-lg font-bold text-warm-white mb-2">{card.title}</h3>
                <p className="text-warm-white/70 text-sm leading-relaxed">{card.text}</p>
                <span className="inline-flex items-center text-gold font-medium text-sm mt-4">
                  Follow the path <span className="ml-2">→</span>
                </span>
              </Link>
            ))}
          </div>
          <p className="text-center text-warm-white/60 mt-8">
            Or start with the pillar guide:{' '}
            <Link href="/blog/ai-for-devops-practical-guide-2026" className="text-gold underline decoration-gold/40 underline-offset-2 hover:text-amber transition-all">
              AI for DevOps in 2026 — practical use cases and a hands-on example →
            </Link>
            <br />
            Kubernetes series entry point:{' '}
            <Link href="/blog/kubectl-commands-cheat-sheet-2026" className="text-gold underline decoration-gold/40 underline-offset-2 hover:text-amber transition-all">
              kubectl Commands Cheat Sheet →
            </Link>
          </p>
        </div>

        {/* Cluster Filter */}
        <div className="mb-10">
          <div className="flex flex-wrap justify-center gap-3">
            {clusters.map((cluster) => (
              <Link
                key={cluster.key}
                href={cluster.key === 'all' ? '/blog' : `/blog?cluster=${cluster.key}`}
                className={cluster.key === active
                  ? 'px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-gold to-amber text-charcoal'
                  : 'px-4 py-2 rounded-full text-sm font-medium border border-gold/30 text-gold hover:bg-gold/10 transition-all'}
              >
                {cluster.label}
              </Link>
            ))}
          </div>
          {active !== 'all' && (
            <p className="text-center text-warm-white/60 text-sm mt-4">
              Showing {visiblePosts.length} tutorials in {activeLabel}.{' '}
              <Link href="/blog" className="text-gold underline decoration-gold/40 underline-offset-2 hover:text-amber transition-all">
                Show all 49
              </Link>
            </p>
          )}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post) => (
            <article
              key={post.slug}
              className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl overflow-hidden hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group transform hover:-translate-y-2"
            >
              {/* Featured Image */}
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.featuredImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2Q0YWYzNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRldk9wcyBFbmdpbmVlcjwvdGV4dD48L3N2Zz4='}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Category */}
                <div className="flex items-center mb-4">
                  <span className="inline-block bg-gold/20 text-gold text-xs font-semibold px-3 py-1 rounded-full">
                    {post.category || 'DevOps'}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-warm-white mb-3 group-hover:text-gold transition-colors">
                  <Link
                    href={`/blog/${post.slug || '#'}`}
                    className="hover:text-gold transition-colors"
                  >
                    {post.title || 'Untitled Post'}
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="text-warm-white/70 text-sm mb-4 leading-relaxed line-clamp-3">
                  {post.excerpt || 'No excerpt available for this post.'}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-warm-white/50 mb-4">
                  <span className="bg-charcoal/40 px-2 py-1 rounded">{post.readTime || '5 min read'}</span>
                  <time dateTime={post.publishDate}>
                    {post.publishDate ? new Date(post.publishDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'October 20, 2025'}
                  </time>
                </div>

                {/* Read More Link */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-gold hover:text-amber font-medium text-sm group-hover:translate-x-2 transition-all"
                >
                  Read More
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State - if no posts */}
        {visiblePosts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-warm-white mb-4">No Tutorials in This Cluster Yet</h3>
            <p className="text-warm-white/70">Try another cluster — or browse all 49 from the All Tutorials view.</p>
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gold mb-10 text-center">Tutorial Index FAQ</h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="border border-gold/20 rounded-xl p-6 bg-rich-black/50">
                <h3 className="text-lg font-bold text-warm-white mb-2">{f.q}</h3>
                <p className="text-warm-white/70 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
