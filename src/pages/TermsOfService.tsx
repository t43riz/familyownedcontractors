import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/30 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 sm:px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: January 29, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to familyownedcontractors.com ("we," "us," "our," or the "Website"). These Terms of Service ("Terms") govern your use of our website and any information you provide through it. By visiting or submitting information on familyownedcontractors.com, you agree to these Terms. If you do not agree, please do not use our Website. This document describes the terms under which you may use our site, submit your information, and understand how that information may be transferred or used.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Nature of Our Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              familyownedcontractors.com operates as a marketing and information facilitation platform. We connect individuals who wish to sell their property ("you," "user," or "submitter") with verified property buyers, investors, and service providers who may be interested in contacting you. We are not a real estate brokerage, agent, lender, or intermediary. We do not represent you or any buyer, and we are not a party to any property transaction. Our sole role is to collect the information you provide voluntarily and transfer or sell that information to third parties for lawful marketing and contact purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Information You Provide</h2>
            <p className="text-muted-foreground leading-relaxed">
              By submitting your information through our website, you agree that all details you provide—including contact information, property details, or related preferences—are accurate and submitted voluntarily. You acknowledge that we may share, license, or sell this information to verified buyers, investors, or related partners for compensation. The purpose of this transfer is to allow these parties to contact you directly about your property or related services. Once your information is transferred, the receiving party controls its use in accordance with applicable privacy laws and their own policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Consent to Use and Sale of Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              By submitting your information on our Website or through our advertisements, you expressly consent to our collection, processing, use, and sale of your submitted information for marketing and contact purposes. You understand that the information you provide may be transferred to verified business partners who may reach out to you by phone, email, text, or other means to discuss your property or related opportunities. You may opt out of future data sales or transfers at any time by contacting us at contact@familyownedcontractors.com or by using the "Do Not Sell or Share My Personal Information" link available on our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. No Guarantees or Endorsements</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not guarantee that submitting your information will result in any contact, offer, sale, or transaction. We do not guarantee the identity, legitimacy, or intent of any individual or company that contacts you as a result of our data transfer or marketing process. We do not endorse or represent any third party, nor do we verify their qualifications, licensing, or financial standing. You are solely responsible for any decision to communicate with, share information with, or transact with any third party who contacts you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. User Responsibilities and Assumption of Risk</h2>
            <p className="text-muted-foreground leading-relaxed">
              You understand and agree that you use this Website and submit your information entirely at your own risk. You are responsible for verifying any third party's identity, intent, and credibility before engaging with them. We are not responsible for any loss, cost, or harm resulting from your communications or dealings with any buyer, investor, or service provider. You assume all risks associated with the submission and transfer of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, familyownedcontractors.com and its owners, employees, and affiliates are not liable for any direct, indirect, incidental, consequential, special, or punitive damages arising out of or relating to your use of the Website or submission of information. This includes, but is not limited to, any loss of profit, loss of business, data breach, unauthorized access, or harm arising from communications with third parties. Our total liability, if any, shall not exceed one hundred dollars ($100) or the amount you paid to us, whichever is less. You agree that this limitation is fair, reasonable, and forms a fundamental condition of your use of our Website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless familyownedcontractors.com, its owners, employees, and affiliates from any claims, damages, losses, or expenses arising from your use of the Website, your submission of information, your communications with third parties, or your violation of these Terms or applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Relationship Between Parties</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nothing in these Terms creates any agency, partnership, joint venture, employment, or fiduciary relationship between you and familyownedcontractors.com. You acknowledge that we act solely as an independent marketing and data facilitation platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Compliance with Laws</h2>
            <p className="text-muted-foreground leading-relaxed">
              We comply with applicable United States privacy and consumer protection laws, including the California Consumer Privacy Act (CCPA/CPRA) and other state laws. You agree to comply with all applicable laws when using our Website. You may exercise your privacy rights, including the right to access, delete, or opt out of the sale of your data, by contacting us at contact@familyownedcontractors.com. For more information about how we collect, use, and protect your data, please see our{' '}
              <a href="/privacy" className="text-primary underline hover:text-primary/80">
                Privacy Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Third-Party Websites and Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Website may contain references or links to third-party websites, advertisements, or resources. We are not responsible for the content, accuracy, or privacy practices of those third parties. Accessing such links is at your own discretion and risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Termination of Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may restrict or terminate your access to the Website at any time, without notice, for any reason or no reason. Termination does not affect any data we have lawfully collected or transferred prior to termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Governing Law and Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by and construed in accordance with the laws of the State of [Insert State], without regard to its conflict of law rules. Any dispute or claim arising out of or related to these Terms or your use of the Website shall be resolved exclusively in the state or federal courts located in [Insert County, State]. You consent to the jurisdiction of those courts and waive any right to a jury trial or to participate in a class or representative action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Changes to These Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. The most recent version will always be available on this page, with the updated effective date noted above. Your continued use of the Website after any updates constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">15. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or requests regarding these Terms, please contact us at contact@familyownedcontractors.com or visit familyownedcontractors.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">16. Disclaimer Summary</h2>
            <p className="text-muted-foreground leading-relaxed">
              familyownedcontractors.com is not a real estate brokerage, agent, or financial intermediary. We do not buy or sell properties, negotiate transactions, or provide legal or financial advice. We collect and transfer user-submitted property inquiry information to verified business partners for marketing and contact purposes. All use of this Website and participation in any subsequent communication or transaction is solely at your own risk.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/30 backdrop-blur-sm py-8 mt-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">
              Home
            </a>
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="/contact" className="hover:text-foreground transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;
