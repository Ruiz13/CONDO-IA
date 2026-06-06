"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const pdf_service_1 = require("./src/pdf/pdf.service");
const fs = __importStar(require("fs"));
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const pdfService = app.get(pdf_service_1.PdfService);
    let logoBase64 = null;
    try {
        const logoBuffer = fs.readFileSync('C:\\Users\\matar\\Downloads\\CONDO-IA\\condo-ia-mobile\\assets\\images\\logo.png');
        logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }
    catch (e) {
        console.log('Logo no encontrado para el test');
    }
    const pdfBuffer = await pdfService.generateInvoicePdf({
        tenantName: "CONDOMINIO RES. IMOLA",
        logoBase64: logoBase64,
        rif: "J-12345678-9",
        phone: "0414-1234567",
        address: "Av. Principal, Edificio Imola, Caracas",
        invoiceNumber: "FAC-ABC123",
        unitNumber: "A-12",
        aliquotPercentage: 1.5,
        totalDebt: 64.96,
        month: 6,
        year: 2026,
        expensesDetails: [
            { description: "Mantenimiento Ascensores", amount: 1500 },
            { description: "Pago Conserjería", amount: 400 },
            { description: "Electricidad Áreas Comunes", amount: 120 }
        ],
        isPaid: false
    });
    fs.writeFileSync('C:\\Users\\matar\\Downloads\\CONDO-IA\\test_invoice.pdf', pdfBuffer);
    console.log("PDF generado en C:\\Users\\matar\\Downloads\\CONDO-IA\\test_invoice.pdf");
    await app.close();
}
bootstrap();
//# sourceMappingURL=test-pdf.js.map