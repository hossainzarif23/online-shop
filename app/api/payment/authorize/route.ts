import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";
const AuthorizeNet = require("authorizenet");
const APIContracts = AuthorizeNet.APIContracts;
const APIControllers = AuthorizeNet.APIControllers;
const Constants = AuthorizeNet.Constants;

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      amount,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardholderName,
      billingAddress,
    } = await request.json();

    // Fix floating-point precision issues by rounding to 2 decimal places
    const validAmount = Math.round(amount * 100) / 100;

    console.log("=== Payment Request Debug ===");
    console.log("Amount:", validAmount);
    console.log("Card Number (last 4):", cardNumber.slice(-4));
    console.log("Expiry:", `${expiryMonth}/${expiryYear}`);

    // Validate required fields
    if (
      !amount ||
      !cardNumber ||
      !expiryMonth ||
      !expiryYear ||
      !cvv ||
      !cardholderName
    ) {
      return NextResponse.json(
        { error: "Missing required payment information" },
        { status: 400 }
      );
    }

    // Validate amount is a valid positive number
    if (isNaN(validAmount) || validAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    // Get Authorize.net credentials from environment
    const apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
    const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
    const environment = process.env.AUTHORIZE_NET_ENVIRONMENT || "sandbox";

    console.log("API Login ID:", apiLoginId ? "Set" : "Missing");
    console.log("Transaction Key:", transactionKey ? "Set" : "Missing");
    console.log("Environment:", environment);
    console.log("Billing Address:", billingAddress ? "Provided" : "Missing");

    if (!apiLoginId || !transactionKey) {
      console.error("Authorize.net credentials not configured");
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    console.log("Creating transaction request...");

    // Create merchant authentication
    const merchantAuthenticationType =
      new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(apiLoginId);
    merchantAuthenticationType.setTransactionKey(transactionKey);

    console.log("Merchant auth created");

    // Create credit card info
    const creditCard = new APIContracts.CreditCardType();
    creditCard.setCardNumber(cardNumber);
    creditCard.setExpirationDate(
      `${expiryYear}-${expiryMonth.padStart(2, "0")}`
    );
    creditCard.setCardCode(cvv);

    console.log(
      "Credit card object created, expiry:",
      `${expiryYear}-${expiryMonth.padStart(2, "0")}`
    );

    // Create payment type
    const paymentType = new APIContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    console.log("Payment type created");

    // Create billing address
    const billTo = new APIContracts.CustomerAddressType();
    if (billingAddress) {
      const firstName = billingAddress.fullName.split(" ")[0] || "";
      const lastName =
        billingAddress.fullName.split(" ").slice(1).join(" ") || "";

      console.log("Setting billing address:", {
        firstName,
        lastName,
        city: billingAddress.city,
        state: billingAddress.state,
        zip: billingAddress.postalCode,
      });

      billTo.setFirstName(firstName);
      billTo.setLastName(lastName);
      billTo.setAddress(billingAddress.addressLine1);
      billTo.setCity(billingAddress.city);
      billTo.setState(billingAddress.state);
      billTo.setZip(billingAddress.postalCode);
      billTo.setCountry(billingAddress.country);
      billTo.setPhoneNumber(billingAddress.phone);
    }

    console.log("Billing address created");

    // Create transaction request
    const transactionRequestType = new APIContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(
      APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
    );
    transactionRequestType.setPayment(paymentType);
    transactionRequestType.setAmount(validAmount);
    if (billingAddress) {
      transactionRequestType.setBillTo(billTo);
    }

    console.log("Transaction request created");

    // Create request with unique reference ID to prevent duplicate transaction errors
    // Note: Authorize.Net refId max length is 20 characters
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const randomStr = Math.random().toString(36).substring(2, 8); // 6 random chars
    const uniqueRefId = `${timestamp}-${randomStr}`; // Format: 12345678-abc123 (15 chars)

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);
    createRequest.setRefId(uniqueRefId);

    console.log("Create request object created with refId:", uniqueRefId);
    console.log(
      "Request JSON:",
      JSON.stringify(createRequest.getJSON(), null, 2)
    );

    // Execute transaction
    const ctrl = new APIControllers.CreateTransactionController(
      createRequest.getJSON()
    );

    // Set endpoint based on environment
    if (environment === "production") {
      ctrl.setEnvironment(Constants.endpoint.production);
    } else {
      ctrl.setEnvironment(Constants.endpoint.sandbox);
    }

    console.log("Executing transaction...");

    // Execute the transaction
    return new Promise<NextResponse>((resolve) => {
      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.CreateTransactionResponse(
          apiResponse
        );

        console.log("=== Authorize.net Response ===");
        console.log("Response received:", response != null);

        if (response != null) {
          try {
            const messages = response.getMessages();
            const resultCode = messages?.getResultCode();

            console.log("Result Code:", resultCode);
            console.log("Messages object:", messages);

            if (
              messages &&
              messages.getMessage &&
              messages.getMessage().length > 0
            ) {
              console.log(
                "Entire Message:",
                messages.getMessage()[0].getText()
              );
            }

            console.log("About to check result code...");
            console.log(
              "Comparing:",
              resultCode,
              "vs",
              APIContracts.MessageTypeEnum.OK
            );

            if (resultCode === APIContracts.MessageTypeEnum.OK) {
              console.log("✓ Result code is OK, proceeding...");
              const transactionResponse = response.getTransactionResponse();

              console.log(
                "Transaction response exists:",
                transactionResponse != null
              );
              console.log(
                "Transaction response type:",
                typeof transactionResponse
              );
              console.log("Full response object keys:", Object.keys(response));

              // Log the entire response to see structure
              try {
                console.log(
                  "Full apiResponse:",
                  JSON.stringify(apiResponse, null, 2)
                );
              } catch (e) {
                console.log("Could not stringify apiResponse");
              }

              // Sometimes the response is an array
              const txnResp = Array.isArray(transactionResponse)
                ? transactionResponse[0]
                : transactionResponse;
              console.log("Processed transaction response:", txnResp != null);

              if (txnResp) {
                const errors = txnResp.getErrors ? txnResp.getErrors() : null;
                console.log("Checking for errors...", errors != null);
                // Check for errors first (even if result code is OK)
                if (
                  errors != null &&
                  errors.getError &&
                  errors.getError().length > 0
                ) {
                  const errorCode = errors.getError()[0].getErrorCode();
                  const errorMessage = errors.getError()[0].getErrorText();

                  console.log("Transaction Error:", errorCode, errorMessage);

                  // Add specific handling for duplicate transaction error
                  let userFriendlyMessage = errorMessage;
                  if (errorCode === "11") {
                    userFriendlyMessage =
                      "This transaction appears to be a duplicate. Please wait a moment before trying again, or change the transaction amount.";
                    console.log(
                      "⚠️ Duplicate transaction detected. Authorize.Net has a 2-minute duplicate detection window."
                    );
                  }

                  resolve(
                    NextResponse.json(
                      {
                        success: false,
                        error: userFriendlyMessage,
                        errorCode,
                        technicalError: errorMessage,
                      },
                      { status: 400 }
                    )
                  );
                } else {
                  // Success!
                  const transId = txnResp.getTransId
                    ? txnResp.getTransId()
                    : null;
                  const authCode = txnResp.getAuthCode
                    ? txnResp.getAuthCode()
                    : null;
                  const responseCode = txnResp.getResponseCode
                    ? txnResp.getResponseCode()
                    : null;

                  console.log("✅ Transaction Success!");
                  console.log("Transaction ID:", transId);
                  console.log("Auth Code:", authCode);
                  console.log("Response Code:", responseCode);

                  const txnMessages = txnResp.getMessages
                    ? txnResp.getMessages()
                    : null;
                  const message =
                    txnMessages &&
                    txnMessages.getMessage &&
                    txnMessages.getMessage().length > 0
                      ? txnMessages.getMessage()[0].getDescription()
                      : "Transaction successful";

                  // Generate receipt number for the order
                  const receiptNumber = `RCP-${Date.now()}-${transId}`;

                  console.log("Sending success response...");

                  resolve(
                    NextResponse.json({
                      success: true,
                      transactionId: transId,
                      authCode: authCode,
                      receiptNumber: receiptNumber,
                      responseCode: responseCode,
                      message: message,
                    })
                  );
                }
              } else {
                console.log("❌ No transaction response");
                resolve(
                  NextResponse.json(
                    { success: false, error: "No transaction response" },
                    { status: 500 }
                  )
                );
              }
            } else {
              // API call failed - this is where E00027 happens
              const messages = response.getMessages().getMessage();
              const errorMessage =
                messages && messages.length > 0
                  ? messages[0].getText()
                  : "Transaction failed";
              const errorCode =
                messages && messages.length > 0
                  ? messages[0].getCode()
                  : "Unknown";

              console.log("API Error:", errorCode, errorMessage);
              console.log(
                "Full error details:",
                JSON.stringify(messages, null, 2)
              );
              console.log("Full response for debugging:");
              try {
                console.log(JSON.stringify(apiResponse, null, 2));
              } catch (e) {
                console.log("Cannot stringify response");
              }

              // E00027 usually means invalid merchant credentials or request format
              if (errorCode === "E00027") {
                console.log("E00027 Error - This usually means:");
                console.log("1. Invalid API credentials");
                console.log(
                  "2. Test mode merchant trying to process live transaction"
                );
                console.log("3. Request format issue");
                console.log(
                  "4. New sandbox account not fully activated (wait 5-10 minutes)"
                );
              }

              resolve(
                NextResponse.json(
                  {
                    success: false,
                    error: errorMessage,
                    errorCode,
                  },
                  { status: 400 }
                )
              );
            }
          } catch (err) {
            console.error("Error processing response:", err);
            resolve(
              NextResponse.json(
                { success: false, error: "Error processing payment response" },
                { status: 500 }
              )
            );
          }
        } else {
          console.log("No response from gateway");
          resolve(
            NextResponse.json(
              { success: false, error: "No response from payment gateway" },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      {
        error: "Payment processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
