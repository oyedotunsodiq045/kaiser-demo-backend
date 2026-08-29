require("dotenv").config();

const connectDb = require("../src/config/db");
const User = require("../src/models/User");

async function seed() {
  await connectDb();

  let staff = await User.findOne({ email: "staff.demo@example.com" });

  if (!staff) {
    staff = await User.create({
      firstName: "Demo",
      lastName: "Staff",
      email: "staff.demo@example.com",
      password: "Password123!",
      accountType: "staff",
      role: "staff",
      status: "active"
    });
  }

  console.log(`Seeded staff user: ${staff.email}`);
  console.log("Password: Password123!");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
