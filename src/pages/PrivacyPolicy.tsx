import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
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
        <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: January 29, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy describes how sellingproperty.net ("we," "us," "our," or the "Company") collects, uses, shares, and protects personal information provided through our website and associated forms. We operate as a marketing and information facilitation service that connects individuals who wish to sell their property with verified property buyers, investors, or service providers who may be interested in making contact, and/or home improvement service inquiries with verified service providers. We are not a real estate brokerage, agent, or intermediary. Our role is limited to collecting and transferring user-submitted inquiry information for marketing and contact purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you visit our website or submit a property inquiry, we collect information that you choose to provide to us, such as your name, email address, phone number, and property details or related preferences. We may also collect certain information automatically through cookies, pixels, and analytics tools such as your IP address, browser type, device identifiers, website activity, ad engagement data, and referring URLs. This data allows us to improve our website performance, measure marketing results, and ensure inquiries are processed efficiently. We do not intentionally collect sensitive personal information such as government identifiers, financial details, or health data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to process property inquiries, facilitate connections between interested parties, and provide marketing and communication services related to property interest or acquisition. The information you submit allows us to contact you about your inquiry and to share that information with verified property buyers or companies who may contact you regarding your property or similar opportunities. We also use information for administrative purposes, analytics, website improvement, and compliance with applicable laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Sale and Sharing of Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may sell or share the information you provide for monetary consideration to verified partners, investors, or related entities that are interested in contacting you in connection with your property inquiry. The transfer of data occurs only after a submission is made voluntarily through our website or advertisements. Once your information is transferred, the receiving party becomes responsible for its use in accordance with applicable privacy laws and their own policies. We do not sell the personal information of individuals under the age of sixteen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Your Rights Under State Privacy Laws</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are a resident of California, Colorado, Virginia, Utah, or Connecticut, you have the right to know what information we collect, request access to that information, request its deletion, correct inaccurate data, and opt out of the sale or sharing of your information. You may exercise these rights by contacting us at contact@sellingproperty.net or by using the "Do Not Sell or Share My Personal Information" link available on our website. Upon receiving such a request, we will verify your identity before taking any action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Opting Out of Sale or Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you wish to prevent the sale or transfer of your submitted information to our partners, you may contact us directly at contact@sellingproperty.net with "Do Not Sell" in the subject line or use the opt-out link provided on our website. Once your opt-out request is processed, your information will no longer be transferred for compensation, unless you later authorize us to do so.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain personal information only for as long as necessary to fulfill the purposes for which it was collected, to comply with legal obligations, or to resolve disputes. After that period, we delete or anonymize data in accordance with applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement reasonable physical, electronic, and administrative measures to protect the information we collect from unauthorized access, use, alteration, or disclosure. However, no online system or data transmission can be guaranteed to be completely secure, and you acknowledge that you share your information at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies, including advertising pixels from Meta and Google, to analyze site usage, track conversions, and measure the effectiveness of our marketing campaigns. These tools may collect non-identifiable data such as page visits, device type, and browser behavior. You can manage or disable cookies in your browser settings or opt out of certain tracking activities by visiting aboutads.info/choices or optout.privacyrights.info.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website and services are intended for adults aged eighteen and older. We do not knowingly collect or sell personal information from individuals under eighteen years of age. If we become aware that information from a minor has been submitted, we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Relationship with Advertising and Data Partners</h2>
            <p className="text-muted-foreground leading-relaxed">
              We work with verified marketing and data partners, including Meta and Google, to deliver and measure advertising campaigns. We comply with the Meta Lead Ads Terms, Meta Business Tools Terms, and Google Ads Data Protection Terms. These partners may collect or receive limited information about your interactions with our website for measurement and analytics purposes. We ensure that any partner receiving information does so under contractual obligations that require compliance with applicable privacy laws and restrict the use of the data to legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. No Guarantees or Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              We make no guarantees or representations about the accuracy, completeness, or reliability of any data, match, or connection made through our services. The transfer of inquiry information does not guarantee that a property will be sold, purchased, or that a connection will result in any commercial transaction. Your use of our website and your participation in any resulting communication or engagement are solely at your own discretion and risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically to reflect changes in our practices, technology, or applicable law. The revised version will be posted on this page with an updated effective date. Continued use of our website following any changes constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or privacy-related requests, please contact us at contact@sellingproperty.net or visit sellingproperty.net.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">15. Summary</h2>
            <p className="text-muted-foreground leading-relaxed">
              sellingproperty.net is a marketing and information facilitation platform that collects and transfers user-submitted property inquiry information to verified partners and buyers for lawful marketing and contact purposes. We comply with all applicable U.S. privacy laws, respect consumer rights, and maintain transparency about how data is collected, used, and sold. By submitting your information on our website, you consent to these practices and acknowledge that your data may be transferred to authorized parties in accordance with this Privacy Policy.
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
            <a href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
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

export default PrivacyPolicy;
