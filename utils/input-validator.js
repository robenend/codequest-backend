import {
	CustomError,
	InvalidNameError,
	InvalidPhoneNumberError,
	PhoneExistedError,
	EmailExistedError,
	InvalidEmailError,
} from "./custom-errors.js";

const nameRegex = /^[A-Za-z]+$/;
const nameRegexWithSpecialChar = /^[A-Za-z\s\-',.$*%#!&"]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^09\d{8}$/;

// Function to validate the first name
export const validateName = (name, special = false) => {
	if (!special && !nameRegex.test(name)) {
		throw new InvalidNameError();
	} else if (special && !nameRegexWithSpecialChar.test(name)) {
		throw new InvalidNameError();
	}
	return true;
};

// Function to validate the contact number
export const validatePhone = async (
	relation,
	phoneNumber,
	id = null,
	email = null
) => {
	const existingPhone = await relation.findFirst({
		where: {
			phoneNumber,
			...(id && { id: { not: id } }),
			...(email && { email: { not: email } }),
		},
	});

	if (existingPhone) throw new PhoneExistedError();
	if (!phoneRegex.test(phoneNumber)) throw new InvalidPhoneNumberError();
};

export const validateEmail = async (relation, email, id = null) => {
	const existingEmail = await relation.findFirst({
		where: {
			email,
			...(id && { id: { not: id } }),
		},
	});

	if (existingEmail) throw new EmailExistedError();
	if (!emailRegex.test(email)) throw new InvalidEmailError();

	return emailRegex.test(email);
};

export const generateUsername = async (roleId, prisma) => {
	let username;
	let isUnique = false;

	let baseUsername = await prisma.userRole.findFirst({
		where: { id: roleId },
		select: { roleName: true },
	});

	if (!baseUsername) throw new Error("Invalid roleId");
	baseUsername = baseUsername.roleName;

	while (!isUnique) {
		const randomNum = Math.floor(Math.random() * 900000) + 10000;
		username = `${baseUsername}${randomNum}`;
		const existingUser = await prisma.user.findFirst({ where: { username } });
		if (!existingUser) {
			isUnique = true;
		}
	}

	return username;
};

export const checkRelationId = async (id, relation, identifier) => {
	const value = await relation.findFirst({
		where: { id },
	});

	if (!value) throw new CustomError(`${identifier} is Invalid`);

	return value;
};

export const checkExisitingValue = async (
	value,
	relation,
	attribute,
	id = null
) => {
	const existingValue = await relation.findFirst({
		where: {
			[attribute]: value,
			...(id && { id: { not: id } }),
		},
	});

	if (existingValue)
		throw new CustomError(`${value} is associated with another record`);
};

export const formatToFloat = (value) => {
	if (typeof value !== "number") {
		throw new Error("Value must be a number");
	}
	return parseFloat(value.toFixed(2)); // Format to 2 decimal places
};

export const formatNumber = (num) => {
	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num);
};
