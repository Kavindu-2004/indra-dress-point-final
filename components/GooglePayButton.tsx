"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

type GooglePayButtonProps = {
  totalPrice: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
  };
};

const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
};

const allowedCardNetworks = ["VISA", "MASTERCARD"];
const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

export default function GooglePayButton({
  totalPrice,
  customer,
}: GooglePayButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    function initGooglePay() {
      if (cancelled) return;

      if (!window.google || !buttonRef.current) {
        attempts += 1;

        if (attempts < 20) {
          setTimeout(initGooglePay, 300);
        } else {
          setStatus("Google Pay is not available on this device/browser.");
        }
        return;
      }

      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: "TEST",
      });

      const isReadyToPayRequest = {
        ...baseRequest,
        allowedPaymentMethods: [
          {
            type: "CARD",
            parameters: {
              allowedAuthMethods: allowedCardAuthMethods,
              allowedCardNetworks,
            },
          },
        ],
      };

      paymentsClient
        .isReadyToPay(isReadyToPayRequest)
        .then((response: any) => {
          if (!response.result || !buttonRef.current) {
            setStatus("Google Pay is not available on this device/browser.");
            return;
          }

          const button = paymentsClient.createButton({
            onClick: () => handleGooglePay(paymentsClient),
            buttonType: "buy",
            buttonColor: "black",
            buttonRadius: 999,
          });

          buttonRef.current.innerHTML = "";
          buttonRef.current.appendChild(button);
        })
        .catch((error: unknown) => {
          console.error("Google Pay readiness error:", error);
          setStatus("Google Pay is not available on this device/browser.");
        });
    }

    initGooglePay();

    return () => {
      cancelled = true;
    };
  }, [totalPrice]);

  async function handleGooglePay(paymentsClient: any) {
    const paymentDataRequest = {
      ...baseRequest,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: allowedCardAuthMethods,
            allowedCardNetworks,
            billingAddressRequired: true,
            billingAddressParameters: {
              format: "FULL",
            },
          },
          tokenizationSpecification: {
            type: "PAYMENT_GATEWAY",
            parameters: {
              gateway: "example",
              gatewayMerchantId: "exampleGatewayMerchantId",
            },
          },
        },
      ],
      merchantInfo: {
        merchantName: "Indra Dress Point",
      },
      transactionInfo: {
        totalPriceStatus: "FINAL",
        totalPrice,
        currencyCode: "LKR",
        countryCode: "LK",
      },
    };

    try {
      const paymentData = await paymentsClient.loadPaymentData(
        paymentDataRequest
      );

      const rawCart = localStorage.getItem("indra_cart");
      const cart = rawCart ? JSON.parse(rawCart) : [];

      const res = await fetch("/api/payments/google-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentData,
          cart,
          amount: Number(totalPrice),
          customer,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem("indra_cart");
        setStatus("Payment successful. Redirecting...");
        window.location.href = `/checkout/success?orderId=${data.orderId}`;
      } else {
        console.error("Google Pay backend error:", data);
        setStatus(data.error || "Google Pay backend processing failed.");
      }
    } catch (error) {
      console.error("Google Pay error:", error);
      setStatus("Google Pay was cancelled or failed.");
    }
  }

  return (
    <div className="space-y-2 w-full">
      <div ref={buttonRef} className="flex justify-center" />
      {status && <p className="text-sm text-gray-600 text-center">{status}</p>}
    </div>
  );
}