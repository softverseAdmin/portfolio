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
import { aiForDevopsBlog } from './ai-for-devops';
import { kubectlCheatSheetBlog } from './kubectl-cheat-sheet';
import { argoCdTutorialBlog } from './argo-cd-tutorial';
import { kubernetesTroubleshootingBlog } from './kubernetes-troubleshooting';
import { kubernetesRequestsLimitsBlog } from './kubernetes-requests-limits';
import { terraformStateManagementBlog } from './terraform-state-management';
import { githubActionsReusableWorkflowsBlog } from './github-actions-reusable-workflows';
import { awsIamLeastPrivilegeBlog } from './aws-iam-least-privilege';
import { kubernetesIngressNetworkingBlog } from './kubernetes-ingress-networking';
import { helmChartsTutorialBlog } from './helm-charts-tutorial';
import { kubernetesCostOptimizationBlog } from './kubernetes-cost-optimization';
import { cicdMonoreposBlog } from './cicd-monorepos';
import { platformEngineeringPracticeBlog } from './platform-engineering-practice';
import { kubernetesObservabilityBlog } from './kubernetes-observability';
import { argoRolloutsBlog } from './argo-rollouts';
import { kubernetesAutoscalingBlog } from './kubernetes-autoscaling';
import { kubernetesSecurityBasicsBlog } from './kubernetes-security-basics';
import { kubernetesStorageBlog } from './kubernetes-storage';
import { kubernetesUpgradesBlog } from './kubernetes-upgrades';
import { kubernetesConfigmapsSecretsBlog } from './kubernetes-configmaps-secrets';
import { terraformModulesBlog } from './terraform-modules';
import { awsVpcBlog } from './aws-vpc';
import { amazonEksBlog } from './amazon-eks';

export const blogPosts = [
  amazonEksBlog,
  awsVpcBlog,
  terraformModulesBlog,
  kubernetesConfigmapsSecretsBlog,
  kubernetesUpgradesBlog,
  kubernetesStorageBlog,
  kubernetesSecurityBasicsBlog,
  kubernetesAutoscalingBlog,
  argoRolloutsBlog,
  kubernetesObservabilityBlog,
  platformEngineeringPracticeBlog,
  cicdMonoreposBlog,
  kubernetesCostOptimizationBlog,
  helmChartsTutorialBlog,
  kubernetesIngressNetworkingBlog,
  awsIamLeastPrivilegeBlog,
  githubActionsReusableWorkflowsBlog,
  terraformStateManagementBlog,
  kubernetesRequestsLimitsBlog,
  kubernetesTroubleshootingBlog,
  argoCdTutorialBlog,
  kubectlCheatSheetBlog,
  aiForDevopsBlog,
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

// Helper function to get related posts: same category first,
// then posts sharing the most tags with the current post
export function getRelatedPosts(currentSlug, limit = 3) {
  const current = blogPosts.find(post => post.slug === currentSlug);
  if (!current) {
    return blogPosts.slice(0, limit);
  }
  const currentTags = new Set((current.tags || []).map(tag => tag.toLowerCase()));
  return blogPosts
    .filter(post => post.slug !== currentSlug)
    .map(post => {
      const sharedTags = (post.tags || []).filter(tag => currentTags.has(tag.toLowerCase())).length;
      const score = (post.category === current.category ? 2 : 0) + sharedTags;
      return { post, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => entry.post);
}
