import { PrismaClient } from "@prisma/client";
import { GraphQLError } from "graphql";
import { logUserAction } from "../controllers/log-controller.js";
import { CustomError } from "../utils/custom-errors.js";
import {
	checkExisitingValue,
	checkRelationId,
	validateName,
} from "../utils/input-validator.js";

const prisma = new PrismaClient();
//

const resolvers = {
	// User
	users: async (parent, { input }) => {
		const {
			pageIndex = 1,
			pageSize = 10,
			query = "",
			filterData = "",
		} = input || {};
		const { status = "" } = filterData;
		const skip = (pageIndex - 1) * pageSize;

		const totalUsers = await prisma.user.count({
			where: {
				AND: [
					{
						OR: [
							{
								profile: {
									OR: [
										{
											firstName: { contains: query },
										},
										{
											lastName: { contains: query },
										},
									],
								},
							},
							{ username: { contains: query } },
							{ role: { roleName: { contains: query } } },
						],
					},

					status === "active"
						? { isActive: true }
						: status === "blocked"
						? { isActive: false }
						: {},
				],
			},
		}); // Get total user count

		const users = await prisma.user.findMany({
			skip,
			take: pageSize,
			where: {
				AND: [
					{
						OR: [
							{
								profile: {
									OR: [
										{
											firstName: { contains: query },
										},
										{
											lastName: { contains: query },
										},
									],
								},
							},
							{ username: { contains: query } },
							{ phoneNumber: { contains: query } },
							{ role: { roleName: { contains: query } } },
						],
					},
					status === "active"
						? { isActive: true }
						: status === "blocked"
						? { isActive: false }
						: {},
				],
			},
			include: {
				role: true,
				profile: true,
				userRoom: true,
			},
		});

		return {
			usersList: users,
			total: totalUsers,
			totalPages: Math.ceil(totalUsers / pageSize),
		};
	},
	user: async (parent, { id }) => {
		return prisma.user.findUnique({
			where: { id },
			include: {
				role: true,
				profile: true,
				userRoom: true,
			},
		});
	},
	getUser: async (req, res) => {
		// Access user data from context
		try {
			const user = await prisma.user.findUnique({
				where: { id: req.user.id },
				include: { profile: true },
			});

			if (!user) return res.status(404).json({ error: "User not found" });

			res.json({
				...user,
			});
		} catch (error) {
			console.error("Error fetching user:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	logs: async (parent, { input }) => {
		const {
			pageIndex = 1,
			pageSize = 10,
			query = "",
			filterData = "",
		} = input || {};
		const { status = "" } = filterData;
		const skip = (pageIndex - 1) * pageSize;

		const totalLogs = await prisma.log.count({
			where: {
				AND: [
					{
						OR: [{ action: { contains: query } }],
					},
				],
			},
		}); // Get total user count

		const logs = await prisma.log.findMany({
			skip,
			take: pageSize,
			where: {
				AND: [
					{
						OR: [{ action: { contains: query } }],
					},
				],
			},
			include: {
				user: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return {
			logsList: logs,
			total: totalLogs, // Return total count for pagination info
			totalPages: Math.ceil(totalLogs / pageSize), // Calculate total pages
		};
	},
	// UserRole
	userRoles: async () => {
		return prisma.userRole.findMany();
	},
	userRole: async (parent, { id }) => {},

	// bank
	banks: async () => {
		return prisma.bank.findMany();
	},
	bank: async (parent, { id }) => {
		return prisma.bank.findUnique({ where: { id } });
	},

	// Selling Unit
	sellingUnits: async () => {
		return prisma.sellingUnit.findMany();
	},
	sellingUnit: async (parent, { id }) => {
		return prisma.sellingUnit.findUnique({ where: { id } });
	},

	// purchasing Unit
	purchasingUnits: async () => {
		return prisma.purchaseUnit.findMany();
	},
	purchasingUnit: async (parent, { id }) => {
		return prisma.purchaseUnit.findUnique({ where: { id } });
	},

	// UserProfile
	userProfiles: async () => {
		return prisma.userProfile.findMany({
			include: {
				user: {
					include: { profile: true },
				},
			},
		});
	},
	userProfile: async () => {
		return prisma.userProfile.findUnique();
	},

	challenges: async (_, { input }, { user }) => {
		const {
			pageIndex = 1,
			pageSize = 10,
			query = "",
			filterData = {},
		} = input || {};

		const { status = "" } = filterData;
		const skip = (pageIndex - 1) * pageSize;

		await logUserAction(user.id, "Requested Purchase Process");

		// Count total challenges based on the search query and filters
		const totalChallenges = await prisma.challenges.count({
			where: {
				AND: [
					// status ? { status } : {}, // Include status filter if provided
					{
						OR: [
							{
								title: { contains: query },
							},
							{
								description: { contains: query },
							},
						],
					},
				],
			},
		});

		// Fetch the challenges with pagination
		const challenges = await prisma.challenges.findMany({
			skip,
			take: pageSize,
			where: {
				AND: [
					// status ? { status } : {}, // Include status filter if provided
					{
						OR: [
							{
								title: { contains: query },
							},
							{
								description: { contains: query },
							},
						],
					},
				],
			},
			orderBy: {
				createdAt: "desc",
			},
			include: {
				category: true,
				rooms: true,
			},
		});

		return {
			challegeList: challenges,
			total: totalChallenges,
			totalPages: Math.ceil(totalChallenges / pageSize),
		};
	},
	challege: async (_, { id }) => {
		return await prisma.challege.findUnique({
			where: {
				id,
			},
			include: { rooms: true, category: true },
		});
	},
	rooms: async (_, { input }, { user }) => {
		const {
			pageIndex = 1,
			pageSize = 10,
			query = "",
			filterData = {},
		} = input || {};

		const { status = "" } = filterData;
		const skip = (pageIndex - 1) * pageSize;

		await logUserAction(user.id, "Requested Purchase Process");

		// Total Rooms
		const totalRooms = await prisma.rooms.count({
			where: {
				AND: [
					// status ? { status } : {}, // Include status filter if provided
					{
						OR: [
							{
								text: { contains: query },
							},
							{
								description: { contains: query },
							},
							{
								hint: { contains: query },
							},
							{
								status: { contains: query },
							},
						],
					},
				],
			},
		});

		// Fetch the challenges with pagination
		const rooms = await prisma.rooms.findMany({
			skip,
			take: pageSize,
			where: {
				AND: [
					// status ? { status } : {}, // Include status filter if provided
					{
						OR: [
							{
								text: { contains: query },
							},
							{
								description: { contains: query },
							},
							{
								hint: { contains: query },
							},
							{
								status: { contains: query },
							},
						],
					},
				],
			},
			orderBy: {
				createdAt: "desc",
			},
			include: {
				challenges: true,
			},
		});

		return {
			roomsList: rooms,
			total: totalRooms,
			totalPages: Math.ceil(totalRooms / pageSize),
		};
	},
	room: async (_, { id }) => {
		return await prisma.rooms.findUnique({
			where: {
				id,
			},
			include: { challenges: true },
		});
	},
	resources: async (_, { input }, { user }) => {
		const {
			pageIndex = 1,
			pageSize = 10,
			query = "",
			filterData = {},
		} = input || {};

		const { status = "" } = filterData;
		const skip = (pageIndex - 1) * pageSize;

		await logUserAction(user.id, "Requested Purchase Process");

		// Count total challenges based on the search query and filters
		const totalResources = await prisma.resources.count({
			where: {
				AND: [
					// status ? { status } : {}, // Include status filter if provided
					{
						OR: [
							{
								type: { contains: query },
							},
							{
								description: { contains: query },
							},
							{
								difficulty: { contains: query },
							},
						],
					},
				],
			},
		});

		// Fetch the challenges with pagination
		const resources = await prisma.resources.findMany({
			skip,
			take: pageSize,
			where: {
				AND: [
					// status ? { status } : {}, // Include status filter if provided
					{
						OR: [
							{
								type: { contains: query },
							},
							{
								description: { contains: query },
							},
							{
								difficulty: { contains: query },
							},
						],
					},
				],
			},
			orderBy: {
				createdAt: "desc",
			},
			include: {
				category: true,
			},
		});

		return {
			resourceList: resources,
			total: totalResources,
			totalPages: Math.ceil(totalResources / pageSize),
		};
	},
	resource: async (_, { id }) => {
		return await prisma.resource.findUnique({
			where: {
				id,
			},
			include: { category: true },
		});
	},

	registerUser: async (parent, { username, userId, firstName, lastName }) => {
		try {
			const existingUser = await prisma.user.findFirst({
				username,
			});

			if (!existingUser) {
				const user = await prisma.user.create({
					data: {
						username: username,
						userId: userId,
					},
					include: {
						role: true,
						profile: true,
					},
				});

				user &&
					(await prisma.profile.create({
						userId: user.id,
						firstName,
						lastName,
					}));
			} else {
				throw new GraphQLError(`${username} already existed`, {
					extensions: {
						code: "BAD_USER_INPUT ",
						http: { status: 401 },
					},
				});
			}
		} catch (err) {
			if (err instanceof CustomError) {
				throw new GraphQLError(err.message, {
					extensions: {
						code: "BAD_USER_INPUT",
						http: { status: 400 },
					},
				});
			}

			// For other errors, throw a generic GraphQLError
			throw new GraphQLError(`Failed to create user: ${err.message}`, {
				extensions: {
					code: "INTERNAL_SERVER_ERROR",
					http: { status: 500 },
				},
			});
		}
	},
	updateUser: async (parent, { userId, ...args }) => {
		try {
			return await prisma.user.update({
				where: { userId },
				data: {
					username: args.username && args.username,
				},
				include: {
					role: true,
					profile: true,
				},
			});
		} catch (err) {
			if (err instanceof CustomError) {
				throw new GraphQLError(err.message, {
					extensions: {
						code: "BAD_USER_INPUT",
						http: { status: 400 },
					},
				});
			}

			// For other errors, throw a generic GraphQLError
			throw new GraphQLError(`Failed to update user: ${err.message}`, {
				extensions: {
					code: "INTERNAL_SERVER_ERROR",
					http: { status: 500 },
				},
			});
		}
	},
	deleteUser: async (parent, { id }) => {
		return await prisma.user.delete({
			where: { id },
		});
	},
	createProfile: async (parent, { userId, firstName, lastName }) => {
		await checkRelationId(userId, prisma.user, "userId");

		return await prisma.userProfile.create({
			data: {
				userId,
				firstName,
				lastName,
			},
			include: {
				user: true,
			},
		});
	},
	updateProfile: async (parent, { id, ...args }) => {
		try {
			args.userId &&
				(await checkRelationId(args.userId, prisma.user, "userId"));

			return await prisma.userProfile.update({
				where: { id },
				data: {
					userId: args.userId && args.userId,
					firstName: args.firstName && args.firstName,
					lastName: args.lastName && args.lastName,
					points: args.points && args.points,
				},
				include: {
					user: true,
				},
			});
		} catch (error) {
			console.log(error);
		}
	},
	deleteProfile: async (parent, { id }) => {
		return await prisma.userProfile.delete({
			where: { id },
			include: {
				user: true,
			},
		});
	},

	createUserRole: async (parent, { roleName, description }) => {
		await checkExisitingValue(roleName, prisma.userRole, "roleName");

		return await prisma.userRole.create({
			data: { roleName, description },
		});
	},
	updateUserRole: async (parent, { id, roleName, description }) => {
		roleName && validateName(roleName, true);

		return await prisma.userRole.update({
			where: { id },
			data: { roleName },
		});
	},
	deleteUserRole: async (parent, { id }) => {
		return await prisma.userRole.delete({
			where: { id },
		});
	},

	createChallenge: async (
		parent,
		{ title, categoryId, description, difficulty, points, status },
		{ user }
	) => {
		await checkRelationId(categoryId, prisma.category, "categoryId");

		return await prisma.challenges.create({
			data: {
				title,
				categoryId,
				description,
				difficulty,
				points,
				status,
			},
			include: {
				rooms: true,
			},
		});
	},
	updateChallenge: async (parent, { id, ...args }) => {
		try {
			args.categoryId &&
				(await checkRelationId(args.categoryId, prisma.category, "categoryId"));

			return await prisma.challenges.update({
				where: { id },
				data: {
					title: args.title && args.title,
					categoryId: args.categoryId && args.categoryId,
					description: args.description && args.description,
					difficulty: args.difficulty && args.difficulty,
					points: args.points && args.points,
					status: args.status && args.status,
				},
				include: {
					rooms: true,
				},
			});
		} catch (error) {
			console.log(error);
		}
	},
	deleteChallenge: async (parent, { id }) => {
		return await prisma.challenges.delete({
			where: { id },
			include: {
				rooms: true,
			},
		});
	},

	createRoom: async (
		parent,
		{ challengeId, text, description, hint, status },
		{ user }
	) => {
		await checkRelationId(challengeId, prisma.challeges, "challengeId");

		return await prisma.rooms.create({
			data: {
				challengeId,
				text,
				description,
				hint,
				status,
			},
			include: {
				challenges: true,
			},
		});
	},
	updateRoom: async (parent, { id, ...args }) => {
		try {
			args.challegeId &&
				(await checkRelationId(
					args.challengeId,
					prisma.challeges,
					"challengeId"
				));

			return await prisma.rooms.update({
				where: { id },
				data: {
					challengeId: args.challengeId && args.challengeId,
					text: args.text && args.text,
					description: args.description && args.description,
					hint: args.hint && args.hint,
					status: args.status !== undefined ? args.status : undefined,
				},
				include: {
					challenges: true,
				},
			});
		} catch (error) {
			console.log(error);
		}
	},
	deleteRoom: async (parent, { id }) => {
		return await prisma.rooms.delete({
			where: { id },
			include: {
				challenges: true,
			},
		});
	},
	createResource: async (
		parent,
		{ categoryId, type, description, url, difficulty, icon },
		{ user }
	) => {
		await checkRelationId(categoryId, prisma.category, "categoryId");

		return await prisma.resources.create({
			data: {
				categoryId,
				type,
				description,
				url,
				difficulty,
				icon,
			},
			include: {
				category: true,
			},
		});
	},
	updateResource: async (parent, { id, ...args }) => {
		try {
			args.categoryId &&
				(await checkRelationId(args.categoryId, prisma.category, "categoryId"));

			return await prisma.resources.update({
				where: { id },
				data: {
					categoryId: args.categoryId && args.categoryId,
					type: args.type && args.type,
					description: args.description && args.description,
					url: args.url && args.url,
					difficulty: args.difficulty && args.difficulty,
					icon: args.icon && args.icon,
				},
				include: {
					category: true,
				},
			});
		} catch (error) {
			console.log(error);
		}
	},
	deleteResource: async (parent, { id }) => {
		return await prisma.resources.delete({
			where: { id },
			include: {
				category: true,
			},
		});
	},
};

export default resolvers;
