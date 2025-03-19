import { Prisma, PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import crom from "node-cron";

const senderEmail = "roberaendale2@gmail.com";
const pass = "axda vdhq ywlb rgkr";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: senderEmail,
		pass: pass,
	},
});

const prisma = new PrismaClient();

let notificationQueue = [];
let timer = null;

const enqueueNotification = (message) => {
	notificationQueue.push(message);

	// Start the timer if it's not already running
	if (!timer) {
		timer = setTimeout(() => {
			processQueue();
		}, 60000);
	}
};

const processQueue = async () => {
	if (notificationQueue.length > 0) {
		const setting = await prisma.setting.findFirst({});
		const emails = setting?.allocationEmails;
		const message = notificationQueue.join("\n");

		transporter.sendMail(
			{
				from: senderEmail,
				to: emails,
				subject: "Allocation Change",
				text: message,
			},
			(error, info) => {
				if (error) {
					return console.log(error);
				}
				console.log("Email sent: " + info.response);
			}
		);

		// Clear the queue after processing
		notificationQueue.length = 0;
	}

	// Reset the timer
	timer = null;
};

export const sendNotification = async (message) => {
	enqueueNotification(message);
};

export const notificationMiddleware = async () => {
	try {
		const setting = await prisma.setting.findFirst({});

		const undeliveredAllocations = await prisma.sales.findMany({
			where: {
				dispatchDate: {
					gt: prisma.raw("allocationDate + INTERVAL ? DAY", [
						setting.dispatchNotifyingDate,
					]),
				},
			},
		});

		const unAllocatedAtcs = await prisma.aTC.findMany({
			where: {
				createdAt: {
					gt: new Date(setting.notifyingDate),
				},
				sales: {
					none: {
						allocationDate: null,
					},
				},
			},
			include: {
				sales: true,
			},
		});

		const emails = setting?.emails;

		const undeliveredMessage = `Reminder: You have undelivered allocations that need attention.`;
		const unAllocatedMessage = `Reminder: You have  Unallocated ATCs that need attention.`;

		if (!emails || !message) {
			throw new Error("Emails or message content is missing");
		}

		transporter.sendMail(
			{
				from: senderEmail,
				to: emails,
				subject: undeliveredMessage,
				text: undeliveredAllocations,
			},
			(error, info) => {
				if (error) {
					console.error("Error sending email:", error);
					return;
				}
				console.log("Email sent:", info.response);
			}
		);

		transporter.sendMail(
			{
				from: senderEmail,
				to: emails,
				subject: unAllocatedMessage,
				text: unAllocatedAtcs,
			},
			(error, info) => {
				if (error) {
					console.error("Error sending email:", error);
					return;
				}
				console.log("Email sent:", info.response);
			}
		);
	} catch (error) {
		console.error("Error in notificationMiddleware:", error);
	}
};
