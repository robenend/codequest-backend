const type = `
type Query {
  users(input: UsersInput): UsersResponse
  user(id: ID!): User
  getUser: UserBrief
  logs(input: LogsInput): LogsResponse
  userRoles: [UserRole]
  userRole(id: ID!): UserRole
  banks: [Bank]
  bank(id: ID!): Bank
  sellingUnits: [SellingUnit]
  sellingUnit(id: ID!): SellingUnit
  purchasingUnits: [PurchasingUnit]
  purchasingUnit(id: ID!): PurchasingUnit
  userProfiles: [UserProfile]
  userProfile(id: ID!): UserProfile
  challenges(input: ChallengesInput): ChallengesResponse
  challenge(id: ID!): Challenge
  rooms(input: RoomsInput): RoomsResponse
  room(id: ID!): Room
  resources(input: ResourcesInput): ResourcesResponse
  resource(id: ID!): Resource
}
type Mutation {
  # User Mutations
  registerUser(username: String!, userId: String!, firstName: String!, lastName: String!): User
  updateUser(userId: String!, username: String): User
  deleteUser(id: ID!): User

  # User Profile Mutations
  createProfile(userId: String!, firstName: String!, lastName: String!): UserProfile
  updateProfile(id: ID!, userId: String, firstName: String, lastName: String, points: Int): UserProfile
  deleteProfile(id: ID!): UserProfile

  # User Role Mutations
  createUserRole(roleName: String!, description: String): UserRole
  updateUserRole(id: ID!, roleName: String, description: String): UserRole
  deleteUserRole(id: ID!): UserRole

  # Challenge Mutations
  createChallenge(title: String!, categoryId: String!, description: String, difficulty: String, points: Int, status: Boolean): Challenge
  updateChallenge(id: ID!, title: String, categoryId: String, description: String, difficulty: String, points: Int, status: Boolean): Challenge
  deleteChallenge(id: ID!): Challenge

  # Room Mutations
  createRoom(challengeId: String!, text: String!, description: String, hint: String, status: Boolean): Room
  updateRoom(id: ID!, challengeId: String, text: String, description: String, hint: String, status: Boolean): Room
  deleteRoom(id: ID!): Room

  # Resource Mutations
  createResource(categoryId: String!, type: String!, description: String, url: String, difficulty: String, icon: String): Resource
  updateResource(id: ID!, categoryId: String, type: String, description: String, url: String, difficulty: String, icon: String): Resource
  deleteResource(id: ID!): Resource
}

type UsersResponse {
  usersList: [User]
  total: Int
  totalPages: Int
}

type LogsResponse {
  logsList: [Log]
  total: Int
  totalPages: Int
}

type ChallengesResponse {
  challegeList: [Challenge]
  total: Int
  totalPages: Int
}

type RoomsResponse {
  roomsList: [Room]
  total: Int
  totalPages: Int
}

type ResourcesResponse {
  resourceList: [Resource]
  total: Int
  totalPages: Int
}

type User {
  id: ID!
  userId: String!
  username: String!
  isActive: Boolean
  createdAt: DateTime
  refreshToken: String
  profile: Profile
  logs: [Log]
  role: UserRole
  userRoom: UserRoom
}

type UserBrief {
  userId: String
  username: String
  role: String
}

type UserRole {
  id: ID!
  roleName: String!
}

type Bank {
  id: ID!
  name: String
}

type SellingUnit {
  id: ID!
  name: String
}

type PurchasingUnit {
  id: ID!
  name: String
}

type UserProfile {
  id: ID!
  user: User
  additionalField: String
}

type Challenge {
  id: ID!
  title: String
  category: Category
  rooms: [Room]
  description: String
  difficulty: String
  points: Int
  status: Boolean
}

type Room {
  id: ID!
  challengeId: String
  text: String
  description: String
  hint: String
  status: Boolean
  createdAt: DateTime
  challenges: Challenge
}

type Resource {
  id: ID!
  categoryId: String
  type: String
  description: String
  url: String
  difficulty: String
  icon: String
  createdAt: DateTime
  category: Category
}

type Log {
  id: ID!
  action: String
  createdAt: DateTime
  user: User
}

type Category {
  id: ID!
  name: String
}

type UserRoom {
  id: ID!
  userId: String
  roomId: String
  completed: Boolean
  user: User
  room: Room
}

input UsersInput {
  pageIndex: Int
  pageSize: Int
  query: String
  filterData: FilterDataInput
}

input FilterDataInput {
  status: String
}

input LogsInput {
  pageIndex: Int
  pageSize: Int
  query: String
  filterData: FilterDataInput
}

input ChallengesInput {
  pageIndex: Int
  pageSize: Int
  query: String
  filterData: FilterDataInput
}

input RoomsInput {
  pageIndex: Int
  pageSize: Int
  query: String
  filterData: FilterDataInput
}

input ResourcesInput {
  pageIndex: Int
  pageSize: Int
  query: String
  filterData: FilterDataInput
}

scalar DateTime

`;

export default type;
