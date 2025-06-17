import { PrismaClient } from "@prisma/client";
import loginSeed from "./seed/loginSeed";
import { crimeTypeSeed } from "./seed/crime";
import { policeStationSeed } from "./seed/station";
import { cctvSeed } from "./seed/cctv";
const prisma = new PrismaClient();
async function main() {
 // Seed CrimeTypes
  await crimeTypeSeed();
  
  // Seed PoliceStations
  await policeStationSeed();
  
  // Seed Login accounts
  await loginSeed();
  
  // Seed CCTV cameras
  await cctvSeed();

  console.log('Seed completed successfully!');
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.log(e);
    await prisma.$disconnect();
    process.exit(1);
  });