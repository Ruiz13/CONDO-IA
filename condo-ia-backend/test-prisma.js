const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function test() {
  try {
    const name = "Residencias Imola 1";
    const floors = 11;
    const aptsPerFloor = 4;
    const locales = 7;
    const aptAliquot = 1.363636;
    
    const totalApts = floors * aptsPerFloor;
    const totalAptAliquotSum = totalApts * aptAliquot;
    let localAliquot = 0;
    if (locales > 0) {
      const remainingAliquot = 100 - totalAptAliquotSum;
      localAliquot = remainingAliquot / locales;
    }

    console.log("totalAptAliquotSum", totalAptAliquotSum);
    console.log("localAliquot", localAliquot);

    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name }
      });

      const adminEmail = `admin@${name.replace(/\s+/g, '').toLowerCase()}.com`;
      const tempPasswordHash = await bcrypt.hash('admin123', 10);
      
      await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash: tempPasswordHash,
          role: 'ADMIN',
          mustChangePassword: true,
          tenantId: tenant.id
        }
      });

      for (let f = 1; f <= floors; f++) {
        for (let a = 1; a <= aptsPerFloor; a++) {
          const unitNumber = `${f}-${a}`;
          
          const owner = await tx.user.create({
            data: {
              email: `apto${unitNumber}@${name.replace(/\s+/g, '').toLowerCase()}.com`,
              passwordHash: tempPasswordHash,
              role: 'RESIDENT',
              mustChangePassword: true,
              tenantId: tenant.id
            }
          });

          await tx.unit.create({
            data: {
              tenantId: tenant.id,
              ownerId: owner.id,
              unitNumber: `Apto ${unitNumber}`,
              isCommercial: false,
              aliquotPercentage: aptAliquot
            }
          });
        }
      }

      for (let l = 1; l <= locales; l++) {
        const unitNumber = `L-${l}`;

        const owner = await tx.user.create({
          data: {
            email: `local${l}@${name.replace(/\s+/g, '').toLowerCase()}.com`,
            passwordHash: tempPasswordHash,
            role: 'RESIDENT',
            mustChangePassword: true,
            tenantId: tenant.id
          }
        });

        await tx.unit.create({
          data: {
            tenantId: tenant.id,
            ownerId: owner.id,
            unitNumber: `Local ${l}`,
            isCommercial: true,
            aliquotPercentage: localAliquot
          }
        });
      }
      
      console.log("Success!");
    });
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
