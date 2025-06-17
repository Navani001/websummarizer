import prisma from "../../src/lib/prisma";


const data = [
  {
    id: 1,
    name: "raj",
    email: "navaneethakrishnan.cs23@bitsathy.ac.in",
    logo: "ff",
    isDeleted: false,
    role: "admin",
    password:"123",
    updatedAt: new Date(),
    createdAt: new Date(),
    
  },{
    id: 3,
    name: "raja",
    email: "navaneetha2006krishnan@gmail.com",
    logo: "ff",
    isDeleted: false,
    role: "police",
    password:"123",
    updatedAt: new Date(),
    createdAt: new Date(),
    
  },
  {
    id: 4,
    name: "system",
    email: "2006navaneethakrishnan@gmail.com",
    logo: "ff",
    isDeleted: false,
    role: "user",
    password:"123",
    updatedAt: new Date(),
    createdAt: new Date(),
    
  },
   {
    id: 2,
    name: "ram",
    email: "thiruselvan.cs23@bitsathy.ac.in",
    role: "police",
    logo: "ff",
    isDeleted: false,
    updatedAt: new Date(),
    createdAt: new Date(),
   
  }
];

async function loginSeed() {
  for (const record of data) {
    await prisma.login.upsert({
      where: { id: record.id },
      create: record,
      update: record
    });
  }
}

export default loginSeed;