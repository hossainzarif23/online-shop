// Test Authorize.net credentials directly
// Run this with: node test-authnet-credentials.js

require("dotenv").config();

const ApiContracts = require("authorizenet").APIContracts;
const ApiControllers = require("authorizenet").APIControllers;
const Constants = require("authorizenet").Constants;

console.log("=== Testing Authorize.net Credentials ===\n");

const apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
const environment = process.env.AUTHORIZE_NET_ENVIRONMENT || "sandbox";

console.log("API Login ID:", apiLoginId);
console.log(
  "Transaction Key:",
  transactionKey ? `${transactionKey.substring(0, 4)}...` : "MISSING"
);
console.log("Environment:", environment);
console.log("");

if (!apiLoginId || !transactionKey) {
  console.error("❌ ERROR: Missing credentials in .env file");
  process.exit(1);
}

// Create merchant authentication
const merchantAuthenticationType =
  new ApiContracts.MerchantAuthenticationType();
merchantAuthenticationType.setName(apiLoginId);
merchantAuthenticationType.setTransactionKey(transactionKey);

// Create credit card
const creditCard = new ApiContracts.CreditCardType();
creditCard.setCardNumber("4111111111111111");
creditCard.setExpirationDate("2025-12");
creditCard.setCardCode("123");

// Create payment
const paymentType = new ApiContracts.PaymentType();
paymentType.setCreditCard(creditCard);

// Create billing address
const billTo = new ApiContracts.CustomerAddressType();
billTo.setFirstName("John");
billTo.setLastName("Doe");
billTo.setAddress("123 Main Street");
billTo.setCity("New York");
billTo.setState("NY");
billTo.setZip("10001");
billTo.setCountry("US");

// Create transaction request
const transactionRequestType = new ApiContracts.TransactionRequestType();
transactionRequestType.setTransactionType(
  ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
);
transactionRequestType.setPayment(paymentType);
transactionRequestType.setAmount(1.0);
transactionRequestType.setBillTo(billTo);

// Create request
const createRequest = new ApiContracts.CreateTransactionRequest();
createRequest.setMerchantAuthentication(merchantAuthenticationType);
createRequest.setTransactionRequest(transactionRequestType);

// Execute transaction
const ctrl = new ApiControllers.CreateTransactionController(
  createRequest.getJSON()
);

if (environment === "production") {
  ctrl.setEnvironment(Constants.endpoint.production);
} else {
  ctrl.setEnvironment(Constants.endpoint.sandbox);
}

console.log("Executing test transaction for $1.00...\n");

ctrl.execute(() => {
  const apiResponse = ctrl.getResponse();
  const response = new ApiContracts.CreateTransactionResponse(apiResponse);

  if (response != null) {
    const messages = response.getMessages();
    const resultCode = messages?.getResultCode();

    console.log("=== RESULT ===");
    console.log("Result Code:", resultCode);
    console.log("");

    if (resultCode === ApiContracts.MessageTypeEnum.OK) {
      console.log("✅ SUCCESS! Your credentials are working!");
      console.log("");

      const transactionResponse = response.getTransactionResponse();
      if (transactionResponse) {
        console.log("Transaction ID:", transactionResponse.getTransId());
        console.log("Auth Code:", transactionResponse.getAuthCode());
        console.log("Response Code:", transactionResponse.getResponseCode());
      } else {
        console.log(
          "⚠️  Warning: No transaction response, but authentication succeeded"
        );
        console.log("This might mean the account needs more setup time.");
      }
    } else {
      console.log("❌ FAILED! Error processing transaction");
      console.log("");

      const errorMessages = messages.getMessage();
      if (errorMessages && errorMessages.length > 0) {
        errorMessages.forEach((msg, idx) => {
          console.log(`Error ${idx + 1}:`);
          console.log(`  Code: ${msg.getCode()}`);
          console.log(`  Text: ${msg.getText()}`);
        });
      }

      console.log("");
      console.log("Common solutions:");
      console.log("1. Wait 5-10 minutes after creating a new sandbox account");
      console.log("2. Verify credentials at: https://sandbox.authorize.net/");
      console.log(
        "3. Make sure you're using SANDBOX credentials, not production"
      );
      console.log(
        "4. Try generating a new Transaction Key in the sandbox portal"
      );
    }
  } else {
    console.log("❌ No response from Authorize.net");
  }

  console.log("");
});
