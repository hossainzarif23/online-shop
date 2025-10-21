declare module "authorizenet" {
  export namespace ApiContracts {
    class MerchantAuthenticationType {
      setName(name: string): void;
      setTransactionKey(key: string): void;
    }

    class CreditCardType {
      setCardNumber(cardNumber: string): void;
      setExpirationDate(expirationDate: string): void;
      setCardCode(cardCode: string): void;
    }

    class PaymentType {
      setCreditCard(creditCard: CreditCardType): void;
    }

    class CustomerAddressType {
      setFirstName(firstName: string): void;
      setLastName(lastName: string): void;
      setAddress(address: string): void;
      setCity(city: string): void;
      setState(state: string): void;
      setZip(zip: string): void;
      setCountry(country: string): void;
      setPhoneNumber(phoneNumber: string): void;
    }

    class TransactionRequestType {
      setTransactionType(transactionType: string): void;
      setPayment(payment: PaymentType): void;
      setAmount(amount: number): void;
      setBillTo(billTo: CustomerAddressType): void;
    }

    class CreateTransactionRequest {
      setMerchantAuthentication(merchantAuth: MerchantAuthenticationType): void;
      setTransactionRequest(transactionRequest: TransactionRequestType): void;
      getJSON(): any;
    }

    class CreateTransactionResponse {
      constructor(response: any);
      getMessages(): any;
      getTransactionResponse(): any;
    }

    enum MessageTypeEnum {
      OK = "Ok",
      ERROR = "Error",
    }

    enum TransactionTypeEnum {
      AUTHCAPTURETRANSACTION = "authCaptureTransaction",
      AUTHONLYTRANSACTION = "authOnlyTransaction",
    }

    namespace Constants {
      namespace endpoint {
        const production: string;
        const sandbox: string;
      }
    }
  }

  export namespace ApiControllers {
    class CreateTransactionController {
      constructor(request: any);
      setEnvironment(environment: string): void;
      execute(callback: () => void): void;
      getResponse(): any;
    }
  }

  export default ApiContracts;
}
