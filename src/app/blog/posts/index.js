// Central export file for all blog posts
import { gitopsCicdBlog } from './gitops-cicd';
import { kubernetesDeploymentBlog } from './kubernetes-deployment';
import { devsecOpsBlog } from './devsecops';
import { cicdGithubActionsBlog } from './cicd-github-actions';
import { devopsToolsBlog } from './devops-tools';
import { platformEngineeringBlog } from './platform-engineering';
import { japanCareerBlog } from './japan-career';
import { terraformPulumiCloudformationBlog } from './terraform-vs-pulumi-cloudformation';
import { githubActionsGitlabJenkinsBlog } from './github-actions-gitlab-jenkins';
import { awsCostOptimizationBlog } from './aws-cost-optimization';
import { dockerImageOptimizationBlog } from './docker-image-optimization';
import { multiCloudStrategyBlog } from './multi-cloud-strategy';
import { selfHealingInfrastructureBlog } from './self-healing-infrastructure';
import { serverlessVsContainers2025Blog } from './serverless-vs-containers-2025';

export const blogPosts = [
  serverlessVsContainers2025Blog,
  selfHealingInfrastructureBlog,
  multiCloudStrategyBlog,
  dockerImageOptimizationBlog,
  awsCostOptimizationBlog,
  githubActionsGitlabJenkinsBlog,
  gitopsCicdBlog,
  kubernetesDeploymentBlog,
  devsecOpsBlog,
  cicdGithubActionsBlog,
  devopsToolsBlog,
  platformEngineeringBlog,
  japanCareerBlog,
  terraformPulumiCloudformationBlog,
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
