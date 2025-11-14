// Central export file for all blog posts
import { gitopsCicdBlog } from './gitops-cicd';
import { kubernetesDeploymentBlog } from './kubernetes-deployment';
import { devsecOpsBlog } from './devsecops';
import { cicdGithubActionsBlog } from './cicd-github-actions';
import { devopsToolsBlog } from './devops-tools';
import { platformEngineeringBlog } from './platform-engineering';
import { japanCareerBlog } from './japan-career';

export const blogPosts = [
  gitopsCicdBlog,
  kubernetesDeploymentBlog,
  devsecOpsBlog,
  cicdGithubActionsBlog,
  devopsToolsBlog,
  platformEngineeringBlog,
  japanCareerBlog,
];

// Helper function to get a blog post by slug
export function getBlogPost(slug) {
  return blogPosts.find(post => post.slug === slug);
}

// Helper function to get related posts
export function getRelatedPosts(currentSlug, limit = 3) {
  return blogPosts
    .filter(post => post.slug !== currentSlug)
    .slice(0, limit);
}
