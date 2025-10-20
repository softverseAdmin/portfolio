export const metadata = {
  title: 'Cookie Policy - DevOps Engineer',
  description: 'Cookie Policy for DevOps Engineer - Learn about how we use cookies, tracking technologies, and how to manage your cookie preferences.',
  keywords: 'cookie policy, cookies, tracking, GDPR, privacy, data collection',
}

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-deep-black via-rich-black to-charcoal">
      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-6">
            Cookie <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-soft-gold">Policy</span>
          </h1>
          <p className="text-warm-white/70 text-lg">
            Last Updated: October 20, 2025
          </p>
        </div>

        <div className="bg-gradient-to-br from-charcoal/60 to-rich-black backdrop-blur-sm border border-gold/30 rounded-2xl p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gold mb-3 flex items-center">
                <span className="text-2xl mr-3">🍪</span>
                About Cookies
              </h2>
              <p className="text-warm-white/80 leading-relaxed mb-3">
                This Cookie Policy explains how DevOps Engineer (<a href="https://devopsenginer.com" className="text-gold hover:text-amber">devopsenginer.com</a>) uses cookies and similar tracking technologies when you visit our website.
              </p>
              <p className="text-warm-white/80 leading-relaxed">
                By using our website, you consent to the use of cookies in accordance with this Cookie Policy. If you do not agree with our use of cookies, you should adjust your browser settings or refrain from using our website.
              </p>
            </div>
          </section>

          {/* What Are Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-6 flex items-center">
              <span className="text-gold mr-3">1.</span>
              What Are Cookies?
            </h2>
            <p className="text-warm-white/80 leading-relaxed mb-6 ml-6">
              Cookies are small text files that are placed on your computer, smartphone, or other device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p className="text-warm-white/80 leading-relaxed ml-6">
              Cookies can be "persistent" (remain on your device after you close your browser) or "session" cookies (deleted when you close your browser).
            </p>
          </section>

          {/* Why We Use Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-6 flex items-center">
              <span className="text-gold mr-3">2.</span>
              Why We Use Cookies
            </h2>
            <p className="text-warm-white/80 leading-relaxed mb-6 ml-6">
              We use cookies for several important reasons:
            </p>
            <ul className="list-disc list-inside text-warm-white/80 space-y-3 ml-10">
              <li><strong className="text-gold">Essential Functionality:</strong> To ensure our website functions properly and securely</li>
              <li><strong className="text-gold">User Experience:</strong> To remember your preferences and settings</li>
              <li><strong className="text-gold">Analytics:</strong> To understand how visitors interact with our website</li>
              <li><strong className="text-gold">Advertising:</strong> To deliver relevant advertisements and measure campaign effectiveness</li>
              <li><strong className="text-gold">Performance:</strong> To optimize website speed and functionality</li>
            </ul>
          </section>

          {/* Types of Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-6 flex items-center">
              <span className="text-gold mr-3">3.</span>
              Types of Cookies We Use
            </h2>

            <div className="space-y-6 ml-6">
              {/* Essential Cookies */}
              <div className="bg-slate-900/50 border border-gold/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-400 mb-3">3.1 Essential Cookies (Required)</h3>
                <p className="text-warm-white/80 leading-relaxed mb-3">
                  These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services.
                </p>
                <p className="text-warm-white/70 text-sm mb-3"><strong>Purpose:</strong></p>
                <ul className="list-disc list-inside text-warm-white/70 text-sm space-y-1 ml-4">
                  <li>Security and authentication</li>
                  <li>Session management</li>
                  <li>Load balancing</li>
                  <li>Form submission</li>
                </ul>
                <p className="text-warm-white/70 text-sm mt-3">
                  <strong>Duration:</strong> Session or up to 1 year
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-slate-900/50 border border-gold/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gold mb-3">3.2 Analytics and Performance Cookies</h3>
                <p className="text-warm-white/80 leading-relaxed mb-3">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
                <p className="text-warm-white/70 text-sm mb-3"><strong>Services Used:</strong></p>
                <ul className="list-disc list-inside text-warm-white/70 text-sm space-y-1 ml-4">
                  <li><strong>Google Analytics:</strong> Website traffic analysis</li>
                  <li>Page view tracking</li>
                  <li>Bounce rate measurement</li>
                  <li>User journey analysis</li>
                </ul>
                <p className="text-warm-white/70 text-sm mt-3">
                  <strong>Duration:</strong> Up to 2 years
                </p>
                <p className="text-warm-white/70 text-sm mt-2">
                  <strong>Opt-out:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber underline">Google Analytics Opt-out</a>
                </p>
              </div>

              {/* Advertising Cookies */}
              <div className="bg-slate-900/50 border border-gold/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-purple-400 mb-3">3.3 Advertising Cookies</h3>
                <p className="text-warm-white/80 leading-relaxed mb-3">
                  These cookies are used to deliver advertisements that are relevant to you and your interests. They also help measure the effectiveness of advertising campaigns.
                </p>
                <p className="text-warm-white/70 text-sm mb-3"><strong>Services Used:</strong></p>
                <ul className="list-disc list-inside text-warm-white/70 text-sm space-y-1 ml-4">
                  <li><strong>Google AdSense:</strong> Contextual and personalized advertising</li>
                  <li><strong>DoubleClick:</strong> Ad serving and tracking</li>
                  <li>Remarketing and retargeting</li>
                  <li>Conversion tracking</li>
                </ul>
                <p className="text-warm-white/70 text-sm mt-3">
                  <strong>Duration:</strong> Up to 18 months
                </p>
                <p className="text-warm-white/70 text-sm mt-2">
                  <strong>Opt-out:</strong> <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber underline">Google Ads Settings</a>
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="bg-slate-900/50 border border-gold/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-yellow-400 mb-3">3.4 Functional Cookies</h3>
                <p className="text-warm-white/80 leading-relaxed mb-3">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                </p>
                <p className="text-warm-white/70 text-sm mb-3"><strong>Purpose:</strong></p>
                <ul className="list-disc list-inside text-warm-white/70 text-sm space-y-1 ml-4">
                  <li>Language preferences</li>
                  <li>Theme settings (dark/light mode)</li>
                  <li>Newsletter subscription preferences</li>
                  <li>User interface customization</li>
                </ul>
                <p className="text-warm-white/70 text-sm mt-3">
                  <strong>Duration:</strong> Session to 1 year
                </p>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-6 flex items-center">
              <span className="text-gold mr-3">4.</span>
              Third-Party Cookies
            </h2>
            <p className="text-warm-white/80 leading-relaxed mb-6 ml-6">
              We use services provided by third parties that may also set cookies on your device when you visit our website. These third parties include:
            </p>

            <div className="ml-6 space-y-4">
              <div className="bg-slate-900/50 border border-gold/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gold mb-2">Google Analytics</h4>
                <p className="text-warm-white/70 text-sm mb-2">
                  Tracks website traffic and user behavior to help us improve our site.
                </p>
                <p className="text-warm-white/70 text-sm">
                  Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber underline">Google Privacy Policy</a>
                </p>
              </div>

              <div className="bg-slate-900/50 border border-gold/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gold mb-2">Google AdSense</h4>
                <p className="text-warm-white/70 text-sm mb-2">
                  Delivers personalized advertisements based on your interests and browsing history.
                </p>
                <p className="text-warm-white/70 text-sm">
                  Privacy Policy: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber underline">Google Ads Privacy</a>
                </p>
              </div>

              <div className="bg-slate-900/50 border border-gold/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gold mb-2">Social Media Platforms</h4>
                <p className="text-warm-white/70 text-sm mb-2">
                  Enables sharing content on social media and may track your activity across websites.
                </p>
                <p className="text-warm-white/70 text-sm">
                  Review individual privacy policies of social media platforms you interact with.
                </p>
              </div>
            </div>
          </section>

          {/* How to Control Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-6 flex items-center">
              <span className="text-gold mr-3">5.</span>
              How to Control and Delete Cookies
            </h2>
            
            <h3 className="text-xl font-semibold text-gold mb-3 ml-6">5.1 Browser Settings</h3>
            <p className="text-warm-white/80 leading-relaxed mb-6 ml-6">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc list-inside text-warm-white/80 space-y-2 ml-10">
              <li>Block all cookies</li>
              <li>Block third-party cookies only</li>
              <li>Clear cookies when you close your browser</li>
              <li>Delete existing cookies</li>
              <li>Set exceptions for specific websites</li>
            </ul>

            <h3 className="text-xl font-semibold text-gold mb-3 mt-6 ml-6">5.2 Browser-Specific Instructions</h3>
            <div className="ml-6 space-y-3">
              <div className="bg-slate-900/50 border border-gold/30 rounded-lg p-4">
                <p className="text-warm-white/80 mb-2">
                  <strong className="text-gold">Google Chrome:</strong>
                </p>
                <p className="text-warm-white/70 text-sm">
                  Settings → Privacy and security → Cookies and other site data
                </p>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber text-sm underline">Chrome Help</a>
              </div>

              <div className="bg-slate-900/50 border border-gold/30 rounded-lg p-4">
                <p className="text-warm-white/80 mb-2">
                  <strong className="text-gold">Mozilla Firefox:</strong>
                </p>
                <p className="text-warm-white/70 text-sm">
                  Options → Privacy & Security → Cookies and Site Data
                </p>
                <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber text-sm underline">Firefox Help</a>
              </div>

              <div className="bg-slate-900/50 border border-gold/30 rounded-lg p-4">
                <p className="text-warm-white/80 mb-2">
                  <strong className="text-gold">Safari:</strong>
                </p>
                <p className="text-warm-white/70 text-sm">
                  Preferences → Privacy → Manage Website Data
                </p>
                <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber text-sm underline">Safari Help</a>
              </div>

              <div className="bg-slate-900/50 border border-gold/30 rounded-lg p-4">
                <p className="text-warm-white/80 mb-2">
                  <strong className="text-gold">Microsoft Edge:</strong>
                </p>
                <p className="text-warm-white/70 text-sm">
                  Settings → Cookies and site permissions → Manage and delete cookies
                </p>
                <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber text-sm underline">Edge Help</a>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gold mb-3 mt-6 ml-6">5.3 Opt-Out of Interest-Based Advertising</h3>
            <p className="text-warm-white/80 leading-relaxed mb-3 ml-6">
              You can opt out of interest-based advertising from participating companies:
            </p>
            <ul className="list-disc list-inside text-warm-white/80 space-y-2 ml-10">
              <li><a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber underline">Google Ads Settings</a></li>
              <li><a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber underline">Digital Advertising Alliance</a></li>
              <li><a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber underline">Your Online Choices (EU)</a></li>
              <li><a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber underline">Network Advertising Initiative</a></li>
            </ul>

            <h3 className="text-xl font-semibold text-gold mb-3 mt-6 ml-6">5.4 Do Not Track (DNT)</h3>
            <p className="text-warm-white/80 leading-relaxed ml-6">
              We respect Do Not Track (DNT) signals. When DNT is enabled in your browser, we will not track your browsing behavior or use cookies for targeted advertising purposes.
            </p>
          </section>

          {/* Impact of Disabling Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-6 flex items-center">
              <span className="text-gold mr-3">6.</span>
              Impact of Disabling Cookies
            </h2>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 ml-6">
              <p className="text-warm-white/80 leading-relaxed mb-3">
                <strong className="text-yellow-400">⚠️ Important:</strong> If you choose to block or delete cookies, some features of our website may not function properly. Specifically:
              </p>
              <ul className="list-disc list-inside text-warm-white/80 space-y-2 ml-4">
                <li>You may need to re-enter information or preferences</li>
                <li>Some pages may not display correctly</li>
                <li>Certain features may be unavailable</li>
                <li>Your user experience may be degraded</li>
              </ul>
            </div>
          </section>

          {/* Updates to Cookie Policy */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-6 flex items-center">
              <span className="text-gold mr-3">7.</span>
              Updates to This Cookie Policy
            </h2>
            <p className="text-warm-white/80 leading-relaxed ml-6">
              We may update this Cookie Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. We will notify you of any material changes by posting the updated policy on this page with a new "Last Updated" date.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-6 flex items-center">
              <span className="text-gold mr-3">8.</span>
              Questions About Cookies
            </h2>
            <p className="text-warm-white/80 leading-relaxed mb-6 ml-6">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="bg-slate-900/50 border border-gold/30 rounded-lg p-6 ml-6">
              <p className="text-warm-white/80 mb-2"><strong className="text-gold">Email:</strong> <a href="mailto:privacy@devopsenginer.com" className="text-gold hover:text-amber">privacy@devopsenginer.com</a></p>
              <p className="text-warm-white/80 mb-2"><strong className="text-gold">Website:</strong> <a href="https://devopsenginer.com/contact" className="text-gold hover:text-amber">devopsenginer.com/contact</a></p>
              <p className="text-warm-white/80"><strong className="text-gold">Response Time:</strong> We will respond within 30 days</p>
            </div>
          </section>

          {/* Consent */}
          <section className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-warm-white mb-6">
              Your Consent
            </h2>
            <p className="text-warm-white/80 leading-relaxed mb-3">
              By using DevOps Engineer, you consent to our use of cookies in accordance with this Cookie Policy.
            </p>
            <p className="text-warm-white/80 leading-relaxed">
              If you do not agree to our use of cookies, please adjust your browser settings or discontinue use of our website. You can also refer to our <a href="/privacy" className="text-gold hover:text-amber underline">Privacy Policy</a> for more information about how we handle your personal data.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
