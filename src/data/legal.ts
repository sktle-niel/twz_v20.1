export interface LegalSection {
  heading: string
  paragraphs: string[]
}

export const PRIVACY_POLICY: { title: string; intro: string; sections: LegalSection[] } = {
  title: 'Privacy Policy',
  intro:
    'At Two Wheels Zone, we are committed to protecting your privacy. This privacy policy explains how we collect, use, and safeguard your information when you visit our website or use our services.',
  sections: [
    {
      heading: 'Information We Collect',
      paragraphs: [
        'We may collect personal information such as your name, email address, phone number, and payment details when you contact us or make a purchase.',
      ],
    },
    {
      heading: 'How We Use Your Information',
      paragraphs: [
        'Your information is used to provide our services, process transactions, communicate with you, and improve our offerings. We do not sell or share your personal information with third parties without your consent.',
      ],
    },
    {
      heading: 'Data Security',
      paragraphs: [
        'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
      ],
    },
    {
      heading: 'Cookies',
      paragraphs: [
        'Our website may use cookies to enhance your browsing experience. You can control cookie settings through your browser preferences.',
      ],
    },
    {
      heading: 'Changes to This Policy',
      paragraphs: [
        'We may update this privacy policy from time to time. Any changes will be posted on this page with an updated effective date.',
        'If you have any questions about this privacy policy, please contact us at privacy@twowheelszone.com.',
      ],
    },
  ],
}

export const TERMS_OF_SERVICE: { title: string; intro: string; sections: LegalSection[] } = {
  title: 'Terms of Service',
  intro:
    'By purchasing from or transacting with Two Wheels Zone, the customer agrees to the terms below.',
  sections: [
    {
      heading: '1. Warranty Policy',
      paragraphs: [
        'Items come with a 7-day warranty for factory defects only.',
        'Warranty is void if the item is tampered with, modified, or repaired by another shop or unauthorized technician.',
        'Warranty does not cover wear-and-tear, misuse, or damage caused by incorrect installation.',
      ],
    },
    {
      heading: '2. Return & Exchange',
      paragraphs: [
        'Returns or exchanges are accepted within 7 days from the date of purchase.',
        'Item must be complete, unused, and in its original packaging.',
        'Receipt or proof of purchase is required. No receipt = no return/exchange.',
      ],
    },
    {
      heading: '3. Installation Services',
      paragraphs: [
        'Installation fees are non-refundable.',
        'If installation is done by another shop, warranty on the item is automatically void.',
      ],
    },
    {
      heading: '4. Pricing & Payments',
      paragraphs: [
        'Prices are subject to change without prior notice.',
        'Payments accepted: cash, GCash, and bank transfer.',
        'For orders with down payment, cancellation may result in forfeiture of deposit.',
      ],
    },
    {
      heading: '5. Orders & Reservations',
      paragraphs: [
        'Orders must be claimed within 3-5 days unless otherwise arranged.',
        'Unclaimed orders may be released to other customers.',
      ],
    },
    {
      heading: '6. Defective Items',
      paragraphs: [
        'All defective items are subject to inspection.',
        'Replacement or repair will depend on supplier/manufacturer assessment.',
      ],
    },
    {
      heading: '7. No Service from Other Shops',
      paragraphs: [
        'Items tested or repaired by another shop without our approval will invalidate the warranty.',
        'Customers are encouraged to return items to our shop for proper checking.',
      ],
    },
    {
      heading: '8. Liability',
      paragraphs: [
        'The store is not liable for any damage resulting from improper installation, misuse, or modification of the product.',
        'The customer is responsible for ensuring correct compatibility of the product with their motorcycle model.',
      ],
    },
    {
      heading: '9. Customer Responsibility',
      paragraphs: [
        'Please check items before leaving the store.',
        'By purchasing, the customer agrees to these Terms of Service.',
      ],
    },
  ],
}
