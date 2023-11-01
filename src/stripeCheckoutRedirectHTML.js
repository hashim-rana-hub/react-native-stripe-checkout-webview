/* @flow */

/**
 * Generates HTML content that redirects to a Stripe checkout session
 */


const stripeCheckoutRedirectHTML = (
  stripe_public_key: string,
  input:
    | {
      sessionId: string,
      successUrl: string,
      cancelUrl: string,
      // common
      customerEmail?: string,
      billingAddressCollection?: 'required' | 'auto',
      shippingAddressCollection?: {
        allowedCountries: Array<string>,
      },
      locale?: string,
    }
    | {
      clientReferenceId: string,
      successUrl: string,
      cancelUrl: string,
      items?: Array<{ plan: string, quantity: string }>,
      lineItems?: Array<{ price: number, quantity: number }>,
      mode?: 'payment' | 'subscription',
      submitType?: string,
      // common
      customerEmail?: string,
      billingAddressCollection?: 'required' | 'auto',
      shippingAddressCollection?: {
        allowedCountries: Array<string>,
      },
      locale?: string,
    },
  options?: {
    /** The loading item is set on the element with id='sc-loading' */
    htmlContentLoading?: string,
    /** The error is set on the element with id='sc-error-message' */
    htmlContentError?: string,
    /** The extra HTML content to be placed in the HEAD */
    htmlContentHead?: string,
  },
): string => {
  if (!stripe_public_key) {
    throw new Error('Must provide Stripe public key.');
  }
  if (!input) {
    throw new Error('Must provide redirectToCheckout function input.');
  }

  /** Get options or defaults */
  const {
    // htmlContentLoading = '<div id="sc-loading" style="">Loading...</div>',
    htmlContentLoading = `
    <div id="sc-loading" style="
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid #000;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    "></div>

  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
`,
    htmlContentError = '<div id="sc-error-message"></div>',
    htmlContentHead = '',
  } = options || {};

  /** Return html */
  return `
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Stripe Checkout</title>
      <meta name="author" content="A-Tokyo">
      ${htmlContentHead || ''}
    </head>
    <body>
      <!-- Display loading content -->
      <div style="display:flex; justify-content:center;align-items:center; height:100%">
      ${htmlContentLoading || ''}
      </div>
      <!-- Display error content -->
      ${htmlContentError || ''}
      <!-- Exec JS without blocking dom -->      
      <!-- Load Stripe.js -->
      <script src="https://js.stripe.com/v3"></script>
      <!-- Stripe execution script -->
      <script>
        (function initStripeAndRedirectToCheckout () {
          const stripe = Stripe('${stripe_public_key}');
          window.onload = () => {
            console.log('RNSC: window loaded');
            // Redirect to Checkout
            stripe.redirectToCheckout(${JSON.stringify(input)})
            .then((result) => {
                console.log('RNSC: window loaded', result);
                // Remove loading html
                const loadingElement = document.getElementById('sc-loading');
                if (loadingElement) {
                  loadingElement.outerHTML = '';
                }
                // If redirectToCheckout fails due to a browser or network
                // error, display the localized error message to your customer.
                if (result.error) {
                  const displayError = document.getElementById('sc-error-message');
                  if (displayError) {
                    displayError.textContent = result.error.message;
                  }
                }
              }).catch((err) => {
                console.error('RNSC: err', err);
              });
          };
        })();
      </script>
    </body>
  </html>
  `;
};

export default stripeCheckoutRedirectHTML;
