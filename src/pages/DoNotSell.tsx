import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

const DoNotSell = () => {
  const navigate = useNavigate();

  const handleContactClick = () => {
    window.location.href = "mailto:contact@sellingproperty.net?subject=Do Not Sell or Share My Personal Information";
  };

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
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Do Not Sell or Share My Personal Information
        </h1>
        
        <p className="text-sm text-muted-foreground mb-8">
          Effective Date: May 10th 2025
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            This page allows you to exercise your right to opt out of the sale or sharing of your personal information. If you submit a property inquiry on sellingproperty.net, we collect the information you provide and may transfer, license, or sell that information to verified property buyers, investors, or related service providers for marketing and contact purposes. California law defines "sell" as exchanging personal information for monetary or other valuable consideration and defines "share" as disclosing personal information to third parties for cross-context behavioral advertising. When you opt out, we will stop selling or sharing your personal information as defined by these laws.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            This page is intended for residents of California and other states with similar privacy rights. We treat valid opt-out requests from any state in a consistent and good-faith manner. We do not sell the personal information of individuals under the age of sixteen.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            When you submit an opt-out request, we record your preference and apply it to the personal information associated with the identifiers you provide. We also honor browser-based opt-out signals such as Global Privacy Control where technically detectable. If you clear cookies, use a different browser or device, or browse while not logged in, you may need to submit this request again to ensure your choice is recognized across contexts.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">How to Submit Your Request</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              To exercise your right to opt out, please send an email to contact@sellingproperty.net with the subject line "Do Not Sell or Share My Personal Information." Include your full name, email address, phone number, and state of residence so that we can locate your records. You may also include any other identifiers, such as alternate contact details, that will help us process your request accurately.
            </p>
            <Button 
              onClick={handleContactClick}
              className="flex items-center gap-2"
              size="lg"
            >
              <Mail className="w-5 h-5" />
              Submit Opt-Out Request
            </Button>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            After receiving your request, we will confirm receipt and verify your identity. We may contact you for additional information if necessary. Once verified, we will honor your request and confirm that your information has been excluded from any future sale or sharing.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            If you are an authorized agent submitting a request on behalf of another consumer, please indicate that in your email and provide documentation showing proof of authorization. We may contact the consumer directly to verify the request.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            Some sale or sharing of information occurs through online identifiers collected via cookies or similar technologies. You can make cookie-based choices by adjusting your browser settings, using ad platform controls, or visiting optout.privacyrights.info and aboutads.info/choices. Submitting your request through this page is the most reliable way to opt out of our sale or sharing associated with the identifiers you provide.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            If we deny your request, you may appeal by replying to our response and stating why you believe the denial was improper. We will review and respond in a timely manner and will describe any further rights you may have. We do not discriminate against anyone for exercising their privacy rights. Service quality and pricing remain the same regardless of any privacy request.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this process or need assistance, please contact us at contact@sellingproperty.net. We update this page periodically to reflect current practices and compliance requirements.
          </p>
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

export default DoNotSell;
