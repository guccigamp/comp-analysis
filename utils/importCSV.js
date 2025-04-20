import fs from "fs";
import path, {dirname} from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";
import getAddressFromCoordinates from "./geocoder.js";

const prisma = new PrismaClient();
// console.log(await prisma.company)

// Main function to import data from CSV and populate the database
async function importCSV() {
    // Setting the project directory path to keep the file paths relative
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(dirname(__filename))

    const filePath = path.join(__dirname, "utils", "companies_locations.csv");
    const stream = fs.createReadStream(filePath).pipe(csv());

    try {
        for await (const record of stream) {
            // Destructure fields from the CSV record
            const { name, legend_color, latitute, longitute } = record;

            const { address, state } = await getAddressFromCoordinates(
                latitute,
                longitute,
                process.env.GEOCODING_API_KEY
            );

            // Check if the company already exists in the database
            const existingCompany = await prisma.company.findFirst({
                where: { name: name },
            });

            if (!existingCompany) {
                // If the company doesn't exist, create it along with its first facility
                await prisma.company.create({
                    data: {
                        name,
                        legend_color,
                        facility: {
                            create: {
                                latitude: parseFloat(latitute),
                                longitude: parseFloat(longitute),
                                address,
                                state,
                            },
                        },
                    },
                });
            } else {
                // If the company exists, just create a new facility and link it to the company
                await prisma.facilty.create({
                    data: {
                        latitude: parseFloat(latitute),
                        longitude: parseFloat(longitute),
                        address: address,
                        state: state,
                        companyId: existingCompany.id,
                    },
                });
            }
        }

        console.log("✅ CSV imported successfully!");
    } catch (error) {
        console.error("❌ Error importing CSV:", error);
    } finally {
        // Ensure the Prisma client disconnects from the database
        await prisma.$disconnect();
    }
}

// Execute the import
importCSV();
