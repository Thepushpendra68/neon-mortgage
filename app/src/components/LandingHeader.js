import Image from "next/image";
import Link from "next/link";

export default function LandingHeader() {
  return (
    <header className="landing-header">
      <div className="landing-header-content">
        <Link href="/get-mortgage" className="landing-logo">
          <Image 
            src="https://neonmortgage.com/assets/images/logo.png" 
            alt="Neon Mortgage" 
            width={120} 
            height={40}
            priority
          />
        </Link>
        <div className="landing-help-text">
          Need more help? 
          <span className="landing-phone-number">+971 58 800 2132</span>
        </div>
      </div>
    </header>
  );
}