import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faXTwitter, faMastodon, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  const socialLinks = [
    { href: "#", label: "Facebook", icon: faFacebook },
    { href: "#", label: "Twitter", icon: faXTwitter },
    { href: "#", label: "Mastodon", icon: faMastodon },
    { href: "#", label: "Instagram", icon: faInstagram },
  ];

  const footerLinks = ["Site Home", "Playground", "About", "Sitemap", "Contents"];

  return (
    <footer className="bg-[#0d1117] text-white py-10" role="contentinfo" itemScope itemType="http://schema.org/WPFooter">
      <div className="container mx-auto px-4">
        <nav className="text-center mb-6" aria-labelledby="social-heading">
          <h3 id="social-heading" className="sr-only">Follow us on social media</h3>
          <div className="space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="inline-block w-10 h-10 border border-gray-400 rounded-full text-2xl leading-10 text-center opacity-75 hover:opacity-90"
                aria-label={social.label}
              >
                <FontAwesomeIcon icon={social.icon} />
              </a>
            ))}
          </div>
        </nav>

        <hr className="border-t-2 border-white my-6" />

        <nav className="mb-6" aria-labelledby="footer-links-heading">
          <h3 id="footer-links-heading" className="sr-only">Footer Links</h3>
          <ul className="text-center text-lg">
            {footerLinks.map((item) => (
              <li key={item} className="inline-block px-2.5">
                <a href="#" className="opacity-80 hover:opacity-100">{item}</a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-center text-sm text-gray-400">
          © {new Date().getFullYear()} <a href="https://www.sdavidprince.space" className="text-inherit">SDavidPrince</a>. Demo of a footer. Some Rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
