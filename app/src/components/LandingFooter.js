import Image from "next/image";
import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-content">
        <Link href="/get-mortgage" className="landing-footer-logo">
          <Image 
            src="https://neonmortgage.com/assets/images/logo.png" 
            alt="Neon Mortgage" 
            width={100} 
            height={33}
          />
        </Link>
        <p className="landing-footer-tagline">Neon Mortgage - Home Loan in Dubai</p>
        <p className="landing-footer-contact">
          Dubai, UAE • +971 58 800 2132 • <a href="mailto:info@neonmortgage.com">info@neonmortgage.com</a>
        </p>
        <p className="landing-footer-copyright">
          © 2025 Neon Mortgage. All rights reserved.
        </p>
      </div>
    </footer>
  );
}