export class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UsernameTakenError extends CustomError {
  constructor() {
    super("This username is already taken. Please choose another");
  }
}

export class PhoneExistedError extends CustomError {
  constructor() {
    super("Phone number is already registered. Try with another phone number");
  }
}

export class EmailExistedError extends CustomError {
  constructor() {
    super("Email is already registered. Try with another email");
  }
}

export class InvalidNameError extends CustomError {
  constructor() {
    super("Name should be of alphabet characters only");
  }
}

export class InvalidPhoneNumberError extends CustomError {
  constructor() {
    super("Please enter a valid phone number!");
  }
}
export class InvalidEmailError extends CustomError {
  constructor() {
    super("Please enter a valid email!");
  }
}

export class UserCreationError extends CustomError {
  constructor() {
    super("Failed to create user");
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message) {
    super(message);
    this.name = "UnauthorizedError";
    this.extensions = {
      code: "UNAUTHENTICATED", // Set the error code
    };
  }
}

export const customFormatErrorFn = (error) => ({
  message: error.message,
  locations: error.locations,
  path: error.path,
});
