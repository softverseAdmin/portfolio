import Link from 'next/link';

export const metadata = {
  title: 'Cybersecurity Roadmap & Expert Guide | DevOps Enginer',
  description: 'Complete cybersecurity roadmap covering security fundamentals, tools, frameworks, and career paths. Learn ethical hacking, threat hunting, incident response, and security engineering.',
  keywords: 'cybersecurity roadmap, ethical hacking, penetration testing, security tools, CISSP, CEH, incident response, threat hunting, security frameworks, compliance',
  openGraph: {
    title: 'Cybersecurity Roadmap & Expert Guide | DevOps Enginer',
    description: 'Complete cybersecurity roadmap covering security fundamentals, tools, frameworks, and career paths. Learn ethical hacking, threat hunting, incident response, and security engineering.',
    type: 'website',
  }
};

const securityDomains = {
  fundamentals: {
    title: "Security Fundamentals",
    color: "from-red-500 to-orange-500",
    items: [
      { name: "Networking Basics", tools: ["TCP/IP", "OSI Model", "DNS", "HTTP/HTTPS", "VPN"], level: "essential" },
      { name: "Operating Systems", tools: ["Windows Security", "Linux Security", "macOS Security", "Mobile Security"], level: "essential" },
      { name: "Programming & Scripting", tools: ["Python", "PowerShell", "Bash", "JavaScript", "SQL"], level: "essential" },
      { name: "Security Principles", tools: ["CIA Triad", "Risk Management", "Threat Modeling", "Defense in Depth"], level: "essential" }
    ]
  },
  offensive: {
    title: "Offensive Security",
    color: "from-red-600 to-red-500",
    items: [
      { name: "Reconnaissance", tools: ["Nmap", "Shodan", "OSINT", "Recon-ng", "theHarvester"], level: "critical" },
      { name: "Vulnerability Assessment", tools: ["Nessus", "OpenVAS", "Qualys", "Rapid7", "Nuclei"], level: "critical" },
      { name: "Penetration Testing", tools: ["Metasploit", "Burp Suite", "OWASP ZAP", "Cobalt Strike", "Empire"], level: "critical" },
      { name: "Web Application Testing", tools: ["SQLmap", "Nikto", "Dirb", "Gobuster", "Wfuzz"], level: "important" },
      { name: "Wireless Security", tools: ["Aircrack-ng", "Kismet", "WiFi Pineapple", "Wifite", "Reaver"], level: "advanced" }
    ]
  },
  defensive: {
    title: "Defensive Security",
    color: "from-blue-500 to-cyan-500",
    items: [
      { name: "SIEM & Monitoring", tools: ["Splunk", "ELK Stack", "QRadar", "ArcSight", "Sumo Logic"], level: "critical" },
      { name: "Incident Response", tools: ["DFIR Tools", "Volatility", "Autopsy", "Wireshark", "YARA"], level: "critical" },
      { name: "Threat Hunting", tools: ["MITRE ATT&CK", "Sigma Rules", "Hunting Queries", "IOCs", "TTPs"], level: "advanced" },
      { name: "Endpoint Security", tools: ["CrowdStrike", "SentinelOne", "Carbon Black", "ESET", "Symantec"], level: "important" },
      { name: "Network Security", tools: ["Firewall Management", "IDS/IPS", "Network Segmentation", "DLP"], level: "important" }
    ]
  },
  cloudsecurity: {
    title: "Cloud Security",
    color: "from-purple-500 to-blue-500",
    items: [
      { name: "AWS Security", tools: ["IAM", "GuardDuty", "Security Hub", "CloudTrail", "Config"], level: "critical" },
      { name: "Azure Security", tools: ["Security Center", "Sentinel", "Key Vault", "Azure AD", "Defender"], level: "critical" },
      { name: "GCP Security", tools: ["Security Command Center", "Cloud IAM", "Cloud KMS", "VPC Security"], level: "important" },
      { name: "Container Security", tools: ["Trivy", "Twistlock", "Aqua Security", "Falco", "Sysdig"], level: "advanced" },
      { name: "DevSecOps", tools: ["SAST", "DAST", "SCA", "Secret Scanning", "Policy as Code"], level: "advanced" }
    ]
  },
  governance: {
    title: "Governance & Compliance",
    color: "from-green-500 to-teal-500",
    items: [
      { name: "Frameworks", tools: ["NIST", "ISO 27001", "CIS Controls", "COBIT", "FAIR"], level: "critical" },
      { name: "Compliance Standards", tools: ["PCI DSS", "HIPAA", "GDPR", "SOX", "FISMA"], level: "important" },
      { name: "Risk Management", tools: ["Risk Assessment", "BIA", "Vulnerability Management", "Threat Intelligence"], level: "important" },
      { name: "Audit & Assessment", tools: ["Internal Audits", "External Audits", "Penetration Testing", "Compliance Testing"], level: "important" }
    ]
  },
  specialized: {
    title: "Specialized Areas",
    color: "from-indigo-500 to-purple-500",
    items: [
      { name: "Digital Forensics", tools: ["EnCase", "FTK", "X-Ways", "Cellebrite", "Oxygen"], level: "specialized" },
      { name: "Malware Analysis", tools: ["IDA Pro", "Ghidra", "OllyDbg", "Cuckoo Sandbox", "YARA"], level: "specialized" },
      { name: "Reverse Engineering", tools: ["x64dbg", "Radare2", "Binary Ninja", "Hex-Rays", "Frida"], level: "specialized" },
      { name: "Cryptography", tools: ["OpenSSL", "GPG", "Cryptool", "Hash Analysis", "PKI"], level: "advanced" },
      { name: "IoT Security", tools: ["Firmware Analysis", "Hardware Hacking", "Radio Analysis", "Embedded Security"], level: "specialized" }
    ]
  }
};

const securityCertifications = [
  {
    category: "Entry Level",
    difficulty: "Beginner",
    certs: [
      { name: "CompTIA Security+", provider: "CompTIA", focus: "Foundation", duration: "3-6 months" },
      { name: "CompTIA Network+", provider: "CompTIA", focus: "Networking", duration: "3-4 months" },
      { name: "GSEC", provider: "SANS", focus: "General Security", duration: "6-12 months" },
      { name: "CySA+", provider: "CompTIA", focus: "Analyst", duration: "4-6 months" }
    ]
  },
  {
    category: "Professional",
    difficulty: "Intermediate",
    certs: [
      { name: "CEH", provider: "EC-Council", focus: "Ethical Hacking", duration: "6-9 months" },
      { name: "GCIH", provider: "SANS", focus: "Incident Handling", duration: "6-12 months" },
      { name: "GCFA", provider: "SANS", focus: "Forensics", duration: "9-12 months" },
      { name: "OSCP", provider: "Offensive Security", focus: "Penetration Testing", duration: "12-18 months" }
    ]
  },
  {
    category: "Expert Level",
    difficulty: "Advanced",
    certs: [
      { name: "CISSP", provider: "ISC2", focus: "Management", duration: "12-18 months" },
      { name: "CISM", provider: "ISACA", focus: "Management", duration: "12-15 months" },
      { name: "CISSP", provider: "ISC2", focus: "Architecture", duration: "18-24 months" },
      { name: "OSEE", provider: "Offensive Security", focus: "Exploit Development", duration: "24+ months" }
    ]
  },
  {
    category: "Specialized",
    difficulty: "Expert",
    certs: [
      { name: "GIAC Certs", provider: "SANS", focus: "Various Specialties", duration: "Variable" },
      { name: "AWS Security", provider: "AWS", focus: "Cloud Security", duration: "6-12 months" },
      { name: "Azure Security", provider: "Microsoft", focus: "Cloud Security", duration: "6-12 months" },
      { name: "Vendor Specific", provider: "Various", focus: "Tool Specific", duration: "Variable" }
    ]
  }
];

const securityFrameworks = [
  {
    name: "NIST Cybersecurity Framework",
    description: "Comprehensive framework for improving cybersecurity posture",
    functions: ["Identify", "Protect", "Detect", "Respond", "Recover"],
    useCases: ["Risk Management", "Incident Response", "Security Program Development"]
  },
  {
    name: "MITRE ATT&CK",
    description: "Knowledge base of adversary tactics and techniques",
    functions: ["Tactics", "Techniques", "Procedures", "Threat Intelligence"],
    useCases: ["Threat Hunting", "Detection Engineering", "Purple Team Exercises"]
  },
  {
    name: "ISO 27001",
    description: "International standard for information security management",
    functions: ["ISMS", "Risk Assessment", "Controls", "Continuous Improvement"],
    useCases: ["Compliance", "Certification", "Security Governance"]
  },
  {
    name: "CIS Controls",
    description: "Prioritized set of cybersecurity best practices",
    functions: ["Basic", "Foundational", "Organizational", "Implementation Groups"],
    useCases: ["Security Baseline", "Risk Reduction", "Compliance Mapping"]
  }
];

const threatLandscape = [
  {
    type: "Advanced Persistent Threats (APT)",
    description: "Long-term targeted attacks by nation-states or sophisticated groups",
    examples: ["APT28", "APT29", "Lazarus Group", "Equation Group"],
    mitigation: ["Threat Intelligence", "Advanced Detection", "Zero Trust", "Incident Response"]
  },
  {
    type: "Ransomware",
    description: "Malware that encrypts data and demands payment for decryption",
    examples: ["REvil", "Conti", "LockBit", "BlackCat"],
    mitigation: ["Backup Strategy", "Network Segmentation", "Endpoint Protection", "User Training"]
  },
  {
    type: "Supply Chain Attacks",
    description: "Attacks targeting third-party vendors to reach primary targets",
    examples: ["SolarWinds", "Kaseya", "CodeCov", "npm packages"],
    mitigation: ["Vendor Assessment", "Software Bill of Materials", "Code Signing", "Monitoring"]
  },
  {
    type: "Cloud Security Threats",
    description: "Threats specific to cloud infrastructure and services",
    examples: ["Misconfigurations", "Data Breaches", "Account Hijacking", "API Vulnerabilities"],
    mitigation: ["CSPM", "CWPP", "Identity Management", "Encryption"]
  }
];

function SecurityDomainCard({ domain, data }) {
  const getLevelColor = (level) => {
    switch (level) {
      case 'essential':
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'important':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'advanced':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'specialized':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all">
      <h3 className={`text-xl font-bold bg-gradient-to-r ${data.color} bg-clip-text text-transparent mb-4 flex items-center`}>
        <span className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mr-3"></span>
        {data.title}
      </h3>
      <div className="space-y-4">
        {data.items.map((item, index) => (
          <div key={index} className="border border-charcoal/40 rounded-lg p-4 hover:border-red-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-warm-white">{item.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(item.level)}`}>
                {item.level}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.tools.map((tool, toolIndex) => (
                <span
                  key={toolIndex}
                  className="bg-charcoal/60 text-warm-white/80 px-3 py-1 rounded-full text-sm hover:bg-red-500/20 hover:text-red-300 transition-all cursor-default"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationCategory({ category }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Intermediate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Advanced':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Expert':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-red-500/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-red-400">{category.category}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(category.difficulty)}`}>
          {category.difficulty}
        </span>
      </div>
      <div className="space-y-3">
        {category.certs.map((cert, index) => (
          <div key={index} className="p-3 bg-charcoal/30 rounded border border-red-500/10">
            <div className="flex justify-between items-start mb-1">
              <h5 className="font-semibold text-warm-white text-sm">{cert.name}</h5>
              <span className="text-red-300 text-xs">{cert.duration}</span>
            </div>
            <p className="text-warm-white/60 text-xs mb-1">{cert.provider}</p>
            <p className="text-warm-white/80 text-xs">{cert.focus}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FrameworkCard({ framework }) {
  return (
    <div className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-red-500/20 rounded-lg p-6 hover:border-red-500/40 transition-all">
      <h4 className="font-bold text-red-400 mb-3">{framework.name}</h4>
      <p className="text-warm-white/70 text-sm mb-4">{framework.description}</p>
      
      <div className="mb-4">
        <h5 className="font-semibold text-warm-white mb-2">Core Functions:</h5>
        <div className="flex flex-wrap gap-2">
          {framework.functions.map((func, index) => (
            <span key={index} className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">
              {func}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <h5 className="font-semibold text-warm-white mb-2">Use Cases:</h5>
        <div className="flex flex-wrap gap-2">
          {framework.useCases.map((useCase, index) => (
            <span key={index} className="bg-charcoal/60 text-warm-white/80 px-2 py-1 rounded text-xs">
              {useCase}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThreatCard({ threat }) {
  return (
    <div className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-red-500/20 rounded-lg p-6">
      <h4 className="font-bold text-red-400 mb-3">{threat.type}</h4>
      <p className="text-warm-white/70 text-sm mb-4">{threat.description}</p>
      
      <div className="mb-4">
        <h5 className="font-semibold text-warm-white mb-2">Examples:</h5>
        <div className="flex flex-wrap gap-2">
          {threat.examples.map((example, index) => (
            <span key={index} className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">
              {example}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <h5 className="font-semibold text-warm-white mb-2">Mitigation:</h5>
        <div className="flex flex-wrap gap-2">
          {threat.mitigation.map((mit, index) => (
            <span key={index} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
              {mit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CybersecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rich-black via-charcoal to-rich-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-charcoal via-rich-black to-charcoal">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-orange-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-500 mb-8">
              Cybersecurity Expert Guide
            </h1>
            <p className="text-xl text-warm-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
              Master cybersecurity with comprehensive guides covering offensive security, defensive operations, 
              compliance frameworks, and modern threat landscape. Build a career in cybersecurity.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/blog/devsecops-checklist-securing-pipeline-2025"
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all"
              >
                DevSecOps Guide
              </Link>
              <Link
                href="/devops"
                className="border border-red-400 text-red-400 px-8 py-3 rounded-lg font-semibold hover:bg-red-400/10 transition-all"
              >
                DevOps Integration
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Security Domains */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-red-400 mb-4">Cybersecurity Domains</h2>
          <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
            Master essential cybersecurity domains from fundamentals to specialized areas.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="text-warm-white/70 text-sm">Essential/Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
            <span className="text-warm-white/70 text-sm">Important</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="text-warm-white/70 text-sm">Advanced</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
            <span className="text-warm-white/70 text-sm">Specialized</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {Object.entries(securityDomains).map(([key, domain]) => (
            <SecurityDomainCard key={key} domain={key} data={domain} />
          ))}
        </div>
      </div>

      {/* Security Frameworks */}
      <div className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-red-400 mb-4">Security Frameworks</h2>
            <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
              Industry-standard frameworks for building robust security programs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {securityFrameworks.map((framework, index) => (
              <FrameworkCard key={index} framework={framework} />
            ))}
          </div>
        </div>
      </div>

      {/* Threat Landscape */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-red-400 mb-4">Current Threat Landscape</h2>
          <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
            Understanding modern cyber threats and effective mitigation strategies.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {threatLandscape.map((threat, index) => (
            <ThreatCard key={index} threat={threat} />
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-red-400 mb-4">Security Certifications</h2>
            <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
              Professional certifications to advance your cybersecurity career.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {securityCertifications.map((category, index) => (
              <CertificationCategory key={index} category={category} />
            ))}
          </div>
        </div>
      </div>

      {/* Career Path */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 rounded-2xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-6 text-center">Cybersecurity Career Path</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="bg-red-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Learn Fundamentals</h3>
              <p className="text-warm-white/70 text-sm">Master networking, systems, and security basics. Get Security+ certification.</p>
            </div>
            <div className="text-center">
              <div className="bg-red-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Choose Specialization</h3>
              <p className="text-warm-white/70 text-sm">Focus on offensive, defensive, or governance track based on interests.</p>
            </div>
            <div className="text-center">
              <div className="bg-red-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Gain Experience</h3>
              <p className="text-warm-white/70 text-sm">Build hands-on skills through labs, CTFs, and real-world projects.</p>
            </div>
            <div className="text-center">
              <div className="bg-red-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 font-bold">4</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Advanced Expertise</h3>
              <p className="text-warm-white/70 text-sm">Pursue advanced certifications and leadership roles in security.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-charcoal via-rich-black to-charcoal py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-500 mb-6">
            Ready to Start Your Security Journey?
          </h2>
          <p className="text-lg text-warm-white/80 mb-8 leading-relaxed">
            Get expert guidance on cybersecurity fundamentals, advanced techniques, and career development.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all"
            >
              Security Consultation
            </Link>
            <Link
              href="/blog"
              className="border border-red-400 text-red-400 px-8 py-3 rounded-lg font-semibold hover:bg-red-400/10 transition-all"
            >
              Read Security Articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}