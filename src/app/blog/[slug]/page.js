import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogPost, getRelatedPosts } from '../blogData';

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const post = getBlogPost(params.slug);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  return {
    title: post.seo.title,
    description: post.seo.description,
    keywords: post.seo.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
      type: 'article',
      publishedTime: post.publishDate,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
    },
  };
}

export default function BlogPost({ params }) {
  const post = getBlogPost(params.slug);
  
  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-black via-rich-black to-charcoal">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-charcoal to-rich-black">
        <div className="absolute inset-0">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <span className="inline-block bg-gold/20 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-6">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-8">
              {post.title}
            </h1>
            <div className="flex items-center justify-center space-x-6 text-warm-white/70">
              <span>By <span className="text-gold">{post.author}</span></span>
              <span>•</span>
              <time dateTime={post.publishDate} className="text-warm-white/60">
                {new Date(post.publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <span>•</span>
              <span className="text-amber">{post.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Dynamic content based on slug */}
        {post.slug === 'top-10-devops-tools-2025' && <DevOpsToolsContent />}
        
        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gold/30">
          <h3 className="text-lg font-semibold text-warm-white mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gold/20 text-gold text-sm px-3 py-1 rounded-full hover:bg-gold/30 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 pt-8 border-t border-gold/30">
          <Link
            href="/blog"
            className="inline-flex items-center text-gold hover:text-amber font-medium group transition-all"
          >
            <svg className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-warm-white mb-12 text-center">
              Related <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-soft-gold">Articles</span>
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.slug}
                  className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl overflow-hidden hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group transform hover:-translate-y-2"
                >
                  <img
                    src={relatedPost.featuredImage}
                    alt={relatedPost.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2Q0YWYzNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRldk9wcyBFbmdpbmVlcjwvdGV4dD48L3N2Zz4='
                    }}
                  />
                  <div className="p-6">
                    <span className="inline-block bg-gold/20 text-gold text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {relatedPost.category}
                    </span>
                    <h3 className="text-lg font-semibold text-warm-white mb-2 group-hover:text-gold transition-colors">
                      <Link 
                        href={`/blog/${relatedPost.slug}`}
                        className="hover:text-gold transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-warm-white/70 text-sm mb-4 leading-relaxed">
                      {relatedPost.excerpt.substring(0, 100)}...
                    </p>
                    <div className="text-xs text-warm-white/50 bg-charcoal/40 px-2 py-1 rounded inline-block">
                      {relatedPost.readTime}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Content component for the DevOps Tools blog post
function DevOpsToolsContent() {
  const tools = [
    {
      rank: 1,
      name: "GitHub Actions",
      title: "Simplicity Meets Power",
      description: "If there's one platform that quietly became the default for modern CI/CD, it's GitHub Actions. Every time you push code, GitHub can build, test, and deploy automatically — no third-party setup, no complicated servers. In 2025, GitHub expanded its Actions Marketplace with official integrations for AWS Lambda, Google Cloud Run, and Azure Functions. What makes it stand out? You can keep your entire workflow — from version control to production deployment — in one place.",
      proTip: "Use self-hosted runners for faster builds and cost control, especially when handling large monorepos.",
      image: "/images/blog/top-10-devops-tools-2025/github-actions.jpg"
    },
    {
      rank: 2,
      name: "Terraform",
      title: "The Backbone of Infrastructure as Code",
      description: "HashiCorp's Terraform remains the gold standard for managing cloud infrastructure. The language is simple enough for beginners yet powerful enough to manage multi-region, multi-cloud environments. What's new in 2025? Terraform's Drift Detection Engine now predicts inconsistencies before they cause issues — almost like your infrastructure has an early-warning system. Teams that used to juggle hundreds of AWS resources manually can now manage them through a few lines of declarative code.",
      proTip: "Use Terraform Cloud's policy as code feature to enforce compliance automatically across all deployments.",
      image: "/images/blog/top-10-devops-tools-2025/terraform.jpg"
    },
    {
      rank: 3,
      name: "Kubernetes",
      title: "The Beating Heart of Cloud Operations",
      description: "Let's be honest — Kubernetes isn't \"new,\" but in 2025 it's practically unavoidable. It's no longer just for big enterprises; even small teams use managed clusters like EKS, GKE, and AKS. What changed this year? Kubernetes introduced AI-driven autoscaling and network policy intelligence, making cluster optimization less of a guessing game. The best engineers I know treat Kubernetes as a platform, not a product — something that ties together CI/CD, observability, and infrastructure into one coherent flow.",
      image: "/images/blog/top-10-devops-tools-2025/kubernetes.jpg"
    },
    {
      rank: 4,
      name: "Pulumi",
      title: "Modern Infrastructure as Code, But in Real Languages",
      description: "While Terraform uses its own DSL, Pulumi lets you define infrastructure using familiar programming languages — TypeScript, Python, Go, or C#. That simple difference is game-changing for developers who want to reuse code, create abstractions, or share logic between apps and infrastructure. In 2025, Pulumi added AI-assisted IaC generation, suggesting optimized configurations and tagging strategies automatically.",
      example: "You can spin up an entire Kubernetes cluster in AWS with 30 lines of TypeScript — and apply the same logic to GCP by switching one line.",
      image: "/images/blog/top-10-devops-tools-2025/pulumi.jpg"
    },
    {
      rank: 5,
      name: "Argo CD",
      title: "The True GitOps Hero",
      description: "Argo CD turns your Git repository into the single source of truth for deployments. Whenever you push a change, Argo syncs it with your Kubernetes cluster — automatically, securely, and with rollback safety. The best part? It's visual. You can see exactly what's running, what's out of sync, and when something drifts. In 2025, Argo's Progressive Rollout Module became smarter, learning from historical failures to suggest safe deployment speeds.",
      personalNote: "Once you try GitOps with Argo, you'll never go back to manual deployments again.",
      image: "/images/blog/top-10-devops-tools-2025/argo-cd.jpg"
    },
    {
      rank: 6,
      name: "Docker",
      title: "The Old Reliable Workhorse",
      description: "Sure, Docker's been around for over a decade — but in 2025, it's still the glue that holds DevOps together. The latest Docker Scout now uses AI to scan container images for vulnerabilities in real time. It also generates SBOMs (Software Bill of Materials) to meet compliance standards automatically. If you're building microservices, Docker is still the easiest way to ensure your app behaves identically in dev, staging, and production.",
      quickTip: "Pair Docker with BuildKit for faster multi-architecture builds (especially ARM + x86).",
      image: "/images/blog/top-10-devops-tools-2025/docker.jpg"
    },
    {
      rank: 7,
      name: "Prometheus + Grafana",
      title: "Observability, Simplified",
      description: "Ask any operations engineer what keeps them sane, and they'll probably mention Grafana dashboards. Paired with Prometheus, it remains the industry standard for metrics, alerting, and visualization. But the 2025 versions go beyond graphs — they actually predict problems. Thanks to integrations with OpenTelemetry and machine learning models, Grafana can now alert you to anomalies before they impact customers. It's like having a co-pilot watching your production environment 24/7 — minus the coffee breaks.",
      image: "/images/blog/top-10-devops-tools-2025/prometheus-grafana.jpg"
    },
    {
      rank: 8,
      name: "GitHub Copilot for DevOps",
      title: "AI That Codes Infrastructure",
      description: "Remember when Copilot was just for writing code? In 2025, GitHub Copilot for DevOps has expanded its powers. Now it can help you write CI/CD workflows, Kubernetes manifests, and Terraform modules. It even explains deployment failures in plain English — a lifesaver for new engineers learning automation. Instead of searching Stack Overflow at 2 AM, you can ask Copilot, \"Why did my pipeline fail?\" and it'll walk you through the cause.",
      bestUse: "Combine Copilot with Actions to speed up pipeline creation and reduce YAML headaches.",
      image: "/images/blog/top-10-devops-tools-2025/github-copilot.jpg"
    },
    {
      rank: 9,
      name: "GitLab DevSecOps Platform",
      title: "One Tool to Rule Them All",
      description: "GitLab has quietly evolved into a complete DevSecOps suite. You can manage code, pipelines, compliance, and security — all under one login. The 2025 version introduces AI SecureScan, which catches license violations and vulnerabilities before code merges. Many large teams are replacing separate tools (Jira, Jenkins, SonarQube) with GitLab to simplify management and costs.",
      proInsight: "Use GitLab's built-in container registry and merge-request approvals to enforce consistent delivery across microservices.",
      image: "/images/blog/top-10-devops-tools-2025/gitlab-devsecops.jpg"
    },
    {
      rank: 10,
      name: "Datadog AI Monitoring",
      title: "Seeing Everything Before It Breaks",
      description: "Rounding out the list is Datadog's AI-powered monitoring suite. It goes far beyond metrics — combining logs, traces, network performance, and synthetic tests into one platform. What's new in 2025? Datadog's Watchtower AI Engine can now auto-correlate incidents and predict the root cause before human intervention. It's not magic; it's machine learning trained on millions of past incidents across global systems.",
      personalReflection: "Tools like Datadog make you feel less like a firefighter and more like an air-traffic controller — aware, calm, and in control.",
      image: "/images/blog/top-10-devops-tools-2025/datadog.jpg"
    }
  ];

  return (
    <article className="mx-auto px-4 md:px-6 py-12 bg-gradient-to-br from-charcoal/20 to-rich-black/40 border border-gold/20 rounded-2xl text-warm-white leading-relaxed">
      
      {/* Introduction */}
      <section className="mb-12">
        <p className="text-lg text-warm-white/90 leading-relaxed mb-6">
          If you've been in DevOps for a while, you've probably realized one thing: this field never stands still. Every year, new tools promise faster pipelines, cleaner infrastructure, and fewer production fires — but 2025 feels different.
        </p>
        <p className="text-lg text-warm-white/90 leading-relaxed mb-6">
          We're not just automating tasks anymore; we're predicting, adapting, and self-healing. The rise of AI in DevOps means systems that can alert you before something breaks, and code that suggests its own improvements.
        </p>
        <p className="text-lg text-warm-white/90 leading-relaxed">
          In this post, I'll walk you through the 10 tools every serious DevOps engineer should know in 2025 — not because they're trendy, but because they genuinely make your life easier.
        </p>
      </section>

      <div className="space-y-12">
        {tools.map((tool) => (
          <section key={tool.rank} className="space-y-6">
            <h2 className="text-2xl font-semibold text-gold">
              {tool.rank}. {tool.name} — {tool.title}
            </h2>
            
            {/* Tool Image */}
            {tool.image && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gold/20 shadow-lg">
                <img
                  src={tool.image}
                  alt={`${tool.name} - ${tool.title}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              </div>
            )}
            
            <p className="text-warm-white/90 leading-relaxed">
              {tool.description}
            </p>

            {tool.proTip && (
              <div className="bg-gold/10 border-l-4 border-gold p-4 rounded-md">
                <p className="text-warm-white/90 italic">
                  💡 <strong className="text-gold">Pro tip:</strong> {tool.proTip}
                </p>
              </div>
            )}

            {tool.example && (
              <div className="bg-charcoal/40 border-l-4 border-amber p-4 rounded-md">
                <p className="text-warm-white/90">
                  🔧 <strong className="text-amber">Example:</strong> {tool.example}
                </p>
              </div>
            )}

            {tool.personalNote && (
              <div className="bg-gold/5 border border-gold/30 p-4 rounded-md">
                <p className="text-warm-white/90 italic">
                  💬 <strong className="text-gold">Personal note:</strong> {tool.personalNote}
                </p>
              </div>
            )}

            {tool.quickTip && (
              <div className="bg-gold/10 border-l-4 border-gold p-4 rounded-md">
                <p className="text-warm-white/90">
                  💡 <strong className="text-gold">Quick tip:</strong> {tool.quickTip}
                </p>
              </div>
            )}

            {tool.bestUse && (
              <div className="bg-charcoal/40 border-l-4 border-amber p-4 rounded-md">
                <p className="text-warm-white/90">
                  ⚙️ <strong className="text-amber">Best use:</strong> {tool.bestUse}
                </p>
              </div>
            )}

            {tool.proInsight && (
              <div className="bg-gold/5 border border-gold/30 p-4 rounded-md">
                <p className="text-warm-white/90">
                  🌐 <strong className="text-gold">Pro insight:</strong> {tool.proInsight}
                </p>
              </div>
            )}

            {tool.personalReflection && (
              <div className="bg-gold/5 border border-gold/30 p-4 rounded-md">
                <p className="text-warm-white/90 italic">
                  � <strong className="text-gold">Personal reflection:</strong> {tool.personalReflection}
                </p>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Bonus Trend */}
      <section className="space-y-6 mt-12 pt-8 border-t border-gold/30">
        <h2 className="text-2xl font-semibold text-gold">Bonus Trend: AIOps Is Becoming the New Normal</h2>
        <p className="text-warm-white/90 leading-relaxed mb-4">
          All these tools are converging toward one reality — AIOps. That means predictive alerts, self-healing deployments, and smarter observability.
        </p>
        <p className="text-warm-white/90 leading-relaxed">
          Platforms like Dynatrace and Elastic Cloud are embedding intelligence into every step of the DevOps lifecycle. We're moving from reactive dashboards to proactive automation — and it's changing how teams work.
        </p>
      </section>

      {/* Conclusion */}
      <section className="space-y-6 mt-12 pt-8 border-t border-gold/30">
        <h2 className="text-2xl font-semibold text-gold">Conclusion: Build Smarter, Deploy Faster, Sleep Better</h2>
        <p className="text-warm-white/90 leading-relaxed mb-4">
          Choosing tools isn't about chasing trends — it's about picking what fits your team, culture, and workflow. The tools on this list don't replace engineers; they empower them.
        </p>
        <p className="text-warm-white/90 leading-relaxed mb-4">
          In 2025, success in DevOps means combining automation with intuition — machines handle the repetition, and humans bring the creativity.
        </p>
        <p className="text-warm-white/90 leading-relaxed">
          If you're looking to level up your DevOps skills, start by mastering two or three of these tools. Once you understand how they connect, you'll find that the rest falls naturally into place.
        </p>
      </section>

      {/* FAQs */}
      <section className="bg-gradient-to-br from-charcoal/40 to-rich-black rounded-xl p-6 mt-10 border border-gold/20">
        <h2 className="text-2xl font-semibold mb-6 text-gold">Frequently Asked Questions (FAQs)</h2>
        <div className="space-y-6">
          <div className="text-warm-white/90">
            <h3 className="font-semibold text-gold mb-2">Q1. Which DevOps tool should a beginner learn first?</h3>
            <p>Start with GitHub Actions or GitLab CI/CD — both are easy to set up and give instant feedback on your code.</p>
          </div>
          <div className="text-warm-white/90">
            <h3 className="font-semibold text-gold mb-2">Q2. Is Kubernetes still relevant for small companies?</h3>
            <p>Absolutely. Managed services like EKS or GKE make Kubernetes accessible without the overhead of cluster maintenance.</p>
          </div>
          <div className="text-warm-white/90">
            <h3 className="font-semibold text-gold mb-2">Q3. How does AI change DevOps in 2025?</h3>
            <p>AI handles analysis and prediction, reducing alert fatigue and helping engineers focus on strategic work.</p>
          </div>
          <div className="text-warm-white/90">
            <h3 className="font-semibold text-gold mb-2">Q4. Which tools offer the best ROI for startups?</h3>
            <p>Pulumi, GitHub Actions, and Datadog — they combine flexibility, scalability, and visibility without large upfront cost.</p>
          </div>
          <div className="text-warm-white/90">
            <h3 className="font-semibold text-gold mb-2">Q5. What's next for DevOps engineers?</h3>
            <p>The rise of Platform Engineering — teams building internal developer portals powered by Kubernetes and GitOps.</p>
          </div>
        </div>
      </section>

      {/* About Author */}
      <section className="bg-gradient-to-br from-gold/5 to-amber/5 rounded-xl p-6 mt-10 border border-gold/30">
        <h2 className="text-xl font-semibold mb-4 text-gold">About the Author</h2>
        <p className="text-warm-white/90 leading-relaxed">
          <strong className="text-gold">Rabin Adhikari</strong> — DevOps engineer and founder of DevOps Enginer.
        </p>
        <p className="text-warm-white/80 leading-relaxed mt-2">
          Rabin writes about automation, AI tools, and cloud-native engineering — helping developers build faster, safer, and smarter.
        </p>
      </section>
    </article>
  );
}