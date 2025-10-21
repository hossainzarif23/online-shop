"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testPayment = async () => {
    setLoading(true);
    setResult(null);

    console.log("🚀 Starting test payment...");

    // Add randomization to amount to avoid duplicate transaction errors
    const randomCents = Math.floor(Math.random() * 100);
    const testAmount = 10.0 + randomCents / 100; // e.g., 10.47, 10.23, etc.

    const testData = {
      amount: testAmount,
      cardNumber: "4111111111111111",
      expiryMonth: "12",
      expiryYear: "2025",
      cvv: "123",
      cardholderName: "John Doe",
      billingAddress: {
        fullName: "John Doe",
        addressLine1: "123 Main Street",
        addressLine2: "",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US",
        phone: "5551234567",
      },
      shippingAddress: {
        fullName: "John Doe",
        addressLine1: "123 Main Street",
        addressLine2: "",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US",
        phone: "5551234567",
      },
      items: [
        {
          productId: "test-product",
          name: "Test Product",
          price: testAmount,
          quantity: 1,
        },
      ],
    };

    console.log("📦 Test data:", JSON.stringify(testData, null, 2));

    try {
      const response = await fetch("/api/payment/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      console.log("📬 Response status:", response.status);
      console.log("📬 Response data:", JSON.stringify(data, null, 2));

      setResult({
        status: response.status,
        success: response.ok,
        data: data,
      });

      if (response.ok) {
        console.log("✅ Payment successful!");
      } else {
        console.error("❌ Payment failed:", data);
      }
    } catch (error) {
      console.error("💥 Error:", error);
      setResult({
        status: "error",
        success: false,
        data: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Test Data:</h3>
            <div className="bg-slate-100 p-4 rounded text-sm font-mono">
              <p>Amount: $10.00 + random cents (to avoid duplicate detection)</p>
              <p>Card: 4111111111111111</p>
              <p>Expiry: 12/2025</p>
              <p>CVV: 123</p>
              <p>Cardholder: John Doe</p>
              <p>Address: 123 Main Street, New York, NY 10001</p>
            </div>
          </div>

          <Button
            onClick={testPayment}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Processing Payment..." : "🧪 Test Payment Now"}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <h3 className="font-semibold mb-2">
                {result.success ? "✅ Success!" : "❌ Failed"}
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Status:</span> {result.status}
                </p>
                {result.data.transactionId && (
                  <p>
                    <span className="font-semibold">Transaction ID:</span>{" "}
                    {result.data.transactionId}
                  </p>
                )}
                {result.data.authCode && (
                  <p>
                    <span className="font-semibold">Auth Code:</span>{" "}
                    {result.data.authCode}
                  </p>
                )}
                {result.data.error && (
                  <p className="text-red-600">
                    <span className="font-semibold">Error:</span>{" "}
                    {result.data.error}
                  </p>
                )}
                {result.data.errorCode && (
                  <p className="text-red-600">
                    <span className="font-semibold">Error Code:</span>{" "}
                    {result.data.errorCode}
                  </p>
                )}
                {result.data.technicalError && (
                  <p className="text-gray-600 text-xs mt-2">
                    <span className="font-semibold">Technical Details:</span>{" "}
                    {result.data.technicalError}
                  </p>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer font-semibold">
                    Full Response
                  </summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">📋 Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click the "Test Payment Now" button</li>
              <li>Watch your terminal console for detailed logs</li>
              <li>Check the result displayed below the button</li>
              <li>Share the terminal output with me if it fails</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">⚠️ Important Notes:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Make sure you have valid Authorize.net sandbox credentials in your{" "}
                <code className="bg-yellow-100 px-1 rounded">.env</code> file.
              </li>
              <li>
                The test amount varies slightly each time to avoid Authorize.Net's duplicate transaction detection (2-minute window).
              </li>
              <li>
                Get free sandbox credentials at:{" "}
                <a
                  href="https://developer.authorize.net/hello_world/sandbox/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  developer.authorize.net
                </a>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
