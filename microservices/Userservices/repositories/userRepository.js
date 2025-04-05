const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const findUserById = async (id) => prisma.user.findUnique({ where: { id } });
const findUserByEmail = async (email) => prisma.user.findUnique({ where: { email } });
const createUser = async (data) => prisma.user.create({ data });
const updateUser = async (id, data) => prisma.user.update({ where: { id }, data });

module.exports = { findUserById, findUserByEmail, createUser, updateUser };
