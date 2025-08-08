import { CheckCircle, Smartphone, Utensils, MapPin } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: MapPin,
      title: 'Discover Local Vendors',
      description: 'Browse through a curated list of local tiffin vendors in your area. Each vendor is carefully verified to ensure quality and reliability.',
      details: [
        'View vendor ratings and reviews',
        'Check delivery areas and timings',
        'Browse authentic homemade menus',
        'Compare prices and offerings'
      ]
    },
    {
      icon: Utensils,
      title: 'Select Your Tiffin',
      description: 'Choose from a variety of delicious, homemade tiffins. Add items to your cart and customize your order with special instructions.',
      details: [
        'Wide variety of cuisines available',
        'Fresh ingredients and homemade taste',
        'Customizable meal options',
        'Transparent pricing with no hidden fees'
      ]
    },
    {
      icon: Smartphone,
      title: 'Secure Payment',
      description: 'Pay easily using our QR code system. All transactions are secure and payments are verified manually for your safety.',
      details: [
        'UPI/QR code based payments',
        'Manual verification process',
        'Secure transaction handling',
        'Multiple payment options'
      ]
    },
    {
      icon: CheckCircle,
      title: 'Enjoy Your Meal',
      description: 'Track your order in real-time and get fresh, hot tiffins delivered right to your doorstep within the estimated time.',
      details: [
        'Real-time order tracking',
        'Fast and reliable delivery',
        'Hot and fresh meals',
        'Rating and feedback system'
      ]
    }
  ];

  const benefits = [
    {
      title: 'Affordable Pricing',
      description: 'Get delicious homemade food at student-friendly prices with transparent costs.',
      icon: '💰'
    },
    {
      title: 'Fresh & Hygienic',
      description: 'All our vendor partners maintain high standards of hygiene and food quality.',
      icon: '🥘'
    },
    {
      title: 'Local Community',
      description: 'Support local businesses and build connections within your community.',
      icon: '🏘️'
    },
    {
      title: 'Convenient Delivery',
      description: 'Get your favorite tiffins delivered right to your hostel or college.',
      icon: '🚚'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How TiffinEats Works
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            From discovering local vendors to enjoying fresh homemade meals – 
            here's how we make getting delicious tiffins simple and convenient.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Steps to Delicious Meals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting your favorite tiffin is just a few clicks away
            </p>
          </div>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}>
                <div className="lg:w-1/2">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4">
                      {index + 1}
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3">
                      <step.icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 text-lg mb-6">
                    {step.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:w-1/2">
                  <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl p-8 text-center h-80 flex items-center justify-center">
                    <step.icon className="h-32 w-32 text-white opacity-80" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TiffinEats?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              More than just food delivery – we're building a community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl group-hover:bg-blue-100 transition-colors">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "What is the delivery time for tiffins?",
                answer: "Most tiffins are delivered within 30-45 minutes during lunch hours. Delivery times may vary based on vendor preparation time and your location."
              },
              {
                question: "How does the payment verification work?",
                answer: "After placing your order, you'll receive a QR code to complete payment via UPI. Vendors manually verify payments before confirming your order for added security."
              },
              {
                question: "What if I'm not satisfied with my order?",
                answer: "We have a rating and review system where you can provide feedback. For serious issues, contact our support team for resolution."
              },
              {
                question: "Can I customize my tiffin order?",
                answer: "Yes! You can add special instructions when placing your order. Many vendors also offer customizable meal options."
              },
              {
                question: "Is there a minimum order amount?",
                answer: "Minimum order amounts vary by vendor, typically ranging from ₹50-100. This information is clearly displayed on each vendor's page."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already enjoying fresh, homemade tiffins daily.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/vendors"
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-lg"
            >
              Browse Vendors
            </a>
            <a
              href="/vendor/signup"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-lg"
            >
              Become a Vendor
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}