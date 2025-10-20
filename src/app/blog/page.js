import Link from 'next/link';
import { blogPosts } from './blogData';

export const metadata = {
  title: 'DevOps Engineering Blog | Latest Insights and Tutorials',
  description: 'Explore the latest DevOps engineering insights, tutorials, and best practices. Stay updated with cloud technologies, automation, and infrastructure management.',
  keywords: 'DevOps, Cloud Computing, Automation, Infrastructure, Tutorials, Engineering',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-black via-rich-black to-charcoal py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-6">
            DevOps Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-soft-gold">Blog</span>
          </h1>
          <p className="text-xl text-warm-white/70 max-w-3xl mx-auto">
            Discover the latest insights, tutorials, and best practices in DevOps engineering, 
            cloud computing, and infrastructure automation.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
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
        {blogPosts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-warm-white mb-4">No Blog Posts Yet</h3>
            <p className="text-warm-white/70">Check back soon for the latest DevOps insights and tutorials!</p>
          </div>
        )}
      </div>
    </div>
  );
}