export const metadata = {
  title: 'Disclaimer - DevOps Engineer',
  description: 'Legal disclaimer for DevOps Engineer - Information about content accuracy, liability limitations, and professional advice disclaimers.',
  keywords: 'disclaimer, legal disclaimer, liability, professional advice, content accuracy',
}

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Disclaimer</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Last Updated: October 20, 2025
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-3 flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                Important Notice
              </h2>
              <p className="text-slate-300 leading-relaxed">
                The information provided on DevOps Engineer (<a href="https://devopsenginer.com" className="text-blue-400 hover:text-blue-300">devopsenginer.com</a>) is for general informational and educational purposes only. By using this website, you acknowledge and agree to the disclaimers set forth below.
              </p>
            </div>
          </section>

          {/* General Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
              <span className="text-blue-400 mr-3">1.</span>
              General Information Disclaimer
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4 ml-6">
              All content, tutorials, guides, code examples, and other materials (collectively, "Content") provided on DevOps Engineer are for informational and educational purposes only. The Content is not intended to be a substitute for professional advice, consultation, or services.
            </p>
            <p className="text-slate-300 leading-relaxed ml-6">
              While we strive to provide accurate, up-to-date, and reliable information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the Content for any purpose.
            </p>
          </section>

          {/* No Professional Advice */}
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
              <span className="text-blue-400 mr-3">2.</span>
              No Professional Advice
            </h2>
            
            <h3 className="text-xl font-semibold text-slate-200 mb-3 ml-6">2.1 Technical Advice</h3>
            <p className="text-slate-300 leading-relaxed mb-4 ml-6">
              The technical information, tutorials, code snippets, and configuration examples provided on this website are for educational purposes and should not be considered professional technical advice. Every IT environment is unique, and what works in one situation may not be suitable for another.
            </p>
            <p className="text-slate-300 leading-relaxed ml-6">
              <strong className="text-yellow-400">Warning:</strong> Always test code, configurations, and commands in a safe, non-production environment before deploying to production systems.
            </p>

            <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-6 ml-6">2.2 Security Advice</h3>
            <p className="text-slate-300 leading-relaxed mb-4 ml-6">
              Security recommendations and best practices provided on this website are general guidelines and may not address all security requirements for your specific environment. Always consult with qualified cybersecurity professionals before implementing security measures.
            </p>

            <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-6 ml-6">2.3 Career and Business Advice</h3>
            <p className="text-slate-300 leading-relaxed ml-6">
              Career guidance, interview preparation tips, and business recommendations are based on general industry experience and should not be considered personalized career counseling or professional business advice.
            </p>
          </section>

          {/* Use at Your Own Risk */}
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
              <span className="text-blue-400 mr-3">3.</span>
              Use at Your Own Risk
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4 ml-6">
              Any reliance you place on the Content provided on DevOps Engineer is strictly at your own risk. We strongly recommend:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-10">
              <li>Testing all code and configurations in isolated, non-production environments</li>
              <li>Backing up your data and systems before implementing any changes</li>
              <li>Reading official documentation for any tools, technologies, or platforms</li>
              <li>Consulting with qualified professionals for critical implementations</li>
              <li>Understanding the implications of any commands or configurations before execution</li>
              <li>Verifying information from multiple authoritative sources</li>
            </ul>
          </section>

          {/* Accuracy and Completeness */}
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
              <span className="text-blue-400 mr-3">4.</span>
              Accuracy and Completeness
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4 ml-6">
              While we make every effort to ensure the accuracy and currency of the information provided:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-10">
              <li>Technology evolves rapidly, and information may become outdated</li>
              <li>Software versions, APIs, and best practices change frequently</li>
              <li>We cannot guarantee that all Content is error-free or current</li>
              <li>Examples may be simplified for educational purposes</li>
              <li>Real-world implementations may require additional considerations</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4 ml-6">
              We reserve the right to update, modify, or remove Content at any time without notice.
            </p>
          </section>

          {/* Technical Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
              <span className="text-blue-400 mr-3">5.</span>
              Technical and Code Disclaimer
            </h2>
            
            <h3 className="text-xl font-semibold text-slate-200 mb-3 ml-6">5.1 Code Examples</h3>
            <p className="text-slate-300 leading-relaxed mb-4 ml-6">
              Code examples, scripts, and configurations provided on this website are provided "as is" without warranty of any kind. While we test code examples, we cannot guarantee they will work in all environments or with all versions of software.
            </p>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 ml-6 mb-4">
              <p className="text-red-300 font-semibold mb-2">🚨 Critical Warning:</p>
              <p className="text-slate-300">
                Running commands or scripts without understanding their implications can cause data loss, system failure, security vulnerabilities, or other serious problems. Always review and understand code before execution.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-slate-200 mb-3 ml-6">5.2 Third-Party Tools and Software</h3>
            <p className="text-slate-300 leading-relaxed mb-4 ml-6">
              We discuss and reference various third-party tools, software, platforms, and services. We are not responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-10">
              <li>The functionality, security, or availability of third-party software</li>
              <li>Changes to third-party tools, APIs, or pricing models</li>
              <li>Compatibility issues between different tools or versions</li>
              <li>Licensing requirements or restrictions of third-party software</li>
              <li>Data handling practices of third-party services</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-6 ml-6">5.3 Version Compatibility</h3>
            <p className="text-slate-300 leading-relaxed ml-6">
              Tutorials and guides may reference specific versions of software, tools, or platforms. Commands, configurations, and features may differ in other versions. Always refer to official documentation for the specific version you're using.
            </p>
          </section>

          {/* Security Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
              <span className="text-blue-400 mr-3">6.</span>
              Security and Privacy Disclaimer
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4 ml-6">
              Security recommendations provided on this website are general best practices and may not be sufficient for all use cases, especially:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-10">
              <li>Highly regulated industries (finance, healthcare, government)</li>
              <li>Environments handling sensitive personal data</li>
              <li>High-security or classified systems</li>
              <li>Systems subject to specific compliance requirements</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4 ml-6">
              Always conduct thorough security assessments and consult with cybersecurity professionals for production systems.
            </p>
          </section>

          {/* External Links Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
              <span className="text-blue-400 mr-3">7.</span>
              External Links and Resources
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4 ml-6">
              DevOps Engineer may contain links to external websites, resources, tools, or services. We do not:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-10">
              <li>Control or endorse the content of external websites</li>
              <li>Guarantee the accuracy, completeness, or currency of external content</li>
              <li>Accept responsibility for the availability of external resources</li>
              <li>Assume liability for any damages resulting from accessing external links</li>
              <li>Warrant the security, privacy practices, or safety of external sites</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4 ml-6">
              Inclusion of links does not imply endorsement, recommendation, or approval of the linked sites or their content.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
              <span className="text-blue-400 mr-3">8.</span>
              Limitation of Liability
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4 ml-6">
              To the maximum extent permitted by applicable law, DevOps Engineer and its owners, authors, contributors, and affiliates shall not be liable for any:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-10">
              <li><strong className="text-slate-200">Data Loss:</strong> Loss, corruption, or unauthorized access to data</li>
              <li><strong className="text-slate-200">System Damage:</strong> Damage to hardware, software, or infrastructure</li>
              <li><strong className="text-slate-200">Business Interruption:</strong> Downtime, service interruption, or lost revenue</li>
              <li><strong className="text-slate-200">Security Incidents:</strong> Breaches, vulnerabilities, or security failures</li>
              <li><strong className="text-slate-200">Financial Losses:</strong> Direct or indirect financial damages</li>
              <li><strong className="text-slate-200">Consequential Damages:</strong> Any indirect, incidental, or consequential damages</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4 ml-6">
              This applies whether such damages arise from use, misuse, or inability to use the Content, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          {/* Professional Consultation */}
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
              <span className="text-blue-400 mr-3">9.</span>
              Professional Consultation Required
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4 ml-6">
              For critical, production, or business-critical implementations, we strongly recommend:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-10">
              <li>Consulting with qualified DevOps engineers or architects</li>
              <li>Engaging cybersecurity professionals for security implementations</li>
              <li>Hiring cloud architects for complex cloud deployments</li>
              <li>Working with legal counsel for compliance matters</li>
              <li>Conducting thorough testing and validation</li>
              <li>Implementing proper backup and disaster recovery procedures</li>
            </ul>
          </section>

          {/* No Warranty */}
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
              <span className="text-blue-400 mr-3">10.</span>
              No Warranty
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4 ml-6">
              All Content on DevOps Engineer is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, either express or implied, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-10">
              <li>Warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy or completeness</li>
              <li>Availability or uninterrupted access</li>
              <li>Freedom from errors or viruses</li>
            </ul>
          </section>

          {/* Changes to Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
              <span className="text-blue-400 mr-3">11.</span>
              Changes to This Disclaimer
            </h2>
            <p className="text-slate-300 leading-relaxed ml-6">
              We reserve the right to update or modify this Disclaimer at any time without prior notice. Changes will be effective immediately upon posting to this page. Your continued use of DevOps Engineer after any changes constitutes acceptance of the updated Disclaimer.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
              <span className="text-blue-400 mr-3">12.</span>
              Governing Law
            </h2>
            <p className="text-slate-300 leading-relaxed ml-6">
              This Disclaimer shall be governed by and construed in accordance with applicable laws. Any disputes relating to this Disclaimer shall be subject to the exclusive jurisdiction of the courts in the applicable jurisdiction.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
              <span className="text-blue-400 mr-3">13.</span>
              Questions About This Disclaimer
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4 ml-6">
              If you have any questions about this Disclaimer, please contact us:
            </p>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 ml-6">
              <p className="text-slate-300 mb-2"><strong className="text-slate-200">Email:</strong> <a href="mailto:legal@devopsenginer.com" className="text-blue-400 hover:text-blue-300">legal@devopsenginer.com</a></p>
              <p className="text-slate-300"><strong className="text-slate-200">Website:</strong> <a href="https://devopsenginer.com/contact" className="text-blue-400 hover:text-blue-300">devopsenginer.com/contact</a></p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">
              Your Acknowledgment
            </h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              BY USING DEVOPS ENGINEER, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THIS DISCLAIMER.
            </p>
            <p className="text-slate-300 leading-relaxed">
              You understand that the Content is provided for educational purposes and that you are solely responsible for any decisions or actions you take based on the information provided on this website.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
