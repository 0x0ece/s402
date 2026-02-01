import { 
  signRequest, 
  addSignatureHeaders, 
  importPrivateKey, 
  HttpRequest,
  PaymentRequiredResponse
} from '@s402/core';
import { sendPayment as sendSolanaPayment } from '@s402/core';
import { FetchConfig, S402FetchOptions } from './types';

/**
 * Create a fetch wrapper with s402 signing and payment capabilities
 */
export function createS402Fetch(config: FetchConfig = {}) {
  return async (url: string | URL, options: S402FetchOptions = {}): Promise<Response> => {
    try {
      console.log(`[s402-fetch] Fetching ${url}`);
      
      const response = await makeRequest(url, options, config);

      // Check for 402 Payment Required
      if (response.status === 402 && config.autoPayment && config.privateKey) {
        console.log('[s402-fetch] Payment required, attempting automatic payment...');
        
        try {
          const paymentInfo = await response.json() as PaymentRequiredResponse;
          
          // Use first payment option (SOL by default)
          const firstOption = paymentInfo.paymentOptions[0];
          
          if (!firstOption) {
            console.error('[s402-fetch] No payment options available');
            return response;
          }
          
          // Send payment
          console.log(`[s402-fetch] Sending ${firstOption.subscriptionPrice} ${firstOption.paymentType}`);
          const paymentResult = await sendSolanaPayment(
            config.privateKey,
            firstOption.serverPublicKey,
            firstOption.subscriptionPrice,
            firstOption.network
          );

          if (!paymentResult.success) {
            console.error('[s402-fetch] Payment failed:', paymentResult.error);
            return response;
          }

          console.log('[s402-fetch] Payment successful! Signature:', paymentResult.signature);
          console.log('[s402-fetch] Waiting 2 seconds for transaction confirmation...');
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Retry the original request
          console.log('[s402-fetch] Retrying original request...');
          return await makeRequest(url, options, config);
        } catch (error) {
          console.error('[s402-fetch] Error handling payment:', error);
          return response;
        }
      }

      return response;
    } catch (error) {
      console.error('[s402-fetch] Fetch error:', error);
      if (config.onError) {
        config.onError(error as Error);
      }
      throw error;
    }
  };
}

/**
 * Internal function to make the actual request
 */
async function makeRequest(
  url: string | URL,
  options: S402FetchOptions,
  config: FetchConfig
): Promise<Response> {
  const urlString = url.toString();
  const method = options.method || 'GET';
  let headers = { ...(options.headers as Record<string, string> || {}) };
  let body = options.body;

  // Add client public key to request
  if (config.publicKey) {
    // Add as header
    headers['x-client-pubkey'] = config.publicKey;
    
    // Also add to body if it's JSON
    if (body && typeof body === 'string') {
      try {
        const bodyObj = JSON.parse(body);
        bodyObj.clientPublicKey = config.publicKey;
        body = JSON.stringify(bodyObj);
      } catch (e) {
        // Not JSON, skip
      }
    } else if (!body && method !== 'GET') {
      // Create body with clientPublicKey
      body = JSON.stringify({ clientPublicKey: config.publicKey });
      headers['content-type'] = 'application/json';
    }
  }

  // Sign the request if configured
  if (config.signRequests && config.privateKey) {
    console.log('[s402-fetch] Signing request with RFC 9421 + ed25519');
    
    // Build HttpRequest object
    const httpRequest: HttpRequest = {
      method: method.toUpperCase(),
      url: urlString,
      headers,
      body: body ? String(body) : undefined
    };
    
    // Import private key and sign the request
    const privateKeyBytes = importPrivateKey(config.privateKey);
    const signatureComponents = await signRequest(
      httpRequest, 
      privateKeyBytes, 
      config.keyId || 'default'
    );
    
    // Add signature headers
    headers = addSignatureHeaders(headers, signatureComponents);
    console.log('[s402-fetch] Request signed successfully');
  }
  
  // Make the request
  const fetchOptions: RequestInit = {
    ...options,
    method,
    headers,
    body: body ? body : options.body
  };
  
  return await fetch(url, fetchOptions);
}

/**
 * Simple wrapper that just returns native fetch
 */
export function s402Fetch(url: string | URL, options?: S402FetchOptions): Promise<Response> {
  const wrappedFetch = createS402Fetch();
  return wrappedFetch(url, options);
}
