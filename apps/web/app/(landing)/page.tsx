import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";

import Footer from "@/components/landing/Footer";
import Problem from "@/components/landing/Problem";
import BeforeAfter from "@/components/landing/BeforeAfter";
import WhyFlowLens from "@/components/landing/WhyFlowLens";
import CallTA from "@/components/landing/CallTA";
import Solution from "@/components/landing/Solution";
import DiscordFeedbackCard from "@/components/socialcard/DiscordcCard";
import Pricing from "@/components/landing/Pricing";

export default function LandingPage() {
  return (
    <>
     <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "FlowLens",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            description:
              "FlowLens shows you exactly what changed in your n8n, Zapier, or Make workflow and why it broke.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
      <Navbar />
      <Hero />
      <Problem/>
      <Solution/>  
      <BeforeAfter/>
      <WhyFlowLens/>
       <Pricing/>
      <CallTA/>
      
      <DiscordFeedbackCard />
      

      <Footer />
    </>
  );
}