"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ReconciliationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciliationController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const payments_service_1 = require("./payments.service");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const generative_ai_1 = require("@google/generative-ai");
let ReconciliationController = ReconciliationController_1 = class ReconciliationController {
    paymentsService;
    logger = new common_1.Logger(ReconciliationController_1.name);
    genAI;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
        this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }
    async parsePdfStatement(file) {
        if (!file) {
            throw new common_1.BadRequestException('Archivo PDF requerido');
        }
        try {
            const pdfData = await (0, pdf_parse_1.default)(file.buffer);
            const text = pdfData.text;
            if (!text || text.trim().length === 0) {
                throw new common_1.BadRequestException('El archivo PDF parece estar vacío o no contiene texto legible.');
            }
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const prompt = `Analiza el siguiente texto extraído de un estado de cuenta bancario. 
Extrae únicamente los depósitos, transferencias recibidas, créditos o abonos (ingresos de dinero al banco, valores positivos). Ignora los cargos, débitos, retiros o gastos (salidas de dinero).
Para cada transacción encontrada, extrae:
1. date: Fecha de la transacción (en formato YYYY-MM-DD o DD/MM/YYYY según aparezca).
2. description: Descripción, concepto o beneficiario/ordenante.
3. referenceNumber: Número de referencia, número de transacción o documento de la operación.
4. amount: Monto de la transacción (debe ser un número positivo, sin símbolos de moneda).

Debes devolver la respuesta ÚNICAMENTE en este formato JSON exacto (un array de objetos):
[
  {"date": "12/06/2026", "description": "TRANSF RECIBIDA DE JUAN PEREZ", "referenceNumber": "987654", "amount": 150.00}
]

No incluyas markdown, comillas raras ni texto adicional fuera del JSON. Si no encuentras ninguna transacción, devuelve un array vacío [].

Aquí está el texto del estado de cuenta bancario:
${text}`;
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const transactions = JSON.parse(cleanJsonStr);
            return {
                success: true,
                transactions: Array.isArray(transactions) ? transactions : []
            };
        }
        catch (error) {
            this.logger.error('Error al parsear PDF bancario', error);
            return {
                success: false,
                error: 'No se pudo procesar el estado de cuenta bancario. Asegúrese de que el PDF sea legible.',
                details: error.message
            };
        }
    }
    async processReconciliation(body) {
        if (!body.transactions || !Array.isArray(body.transactions)) {
            throw new common_1.BadRequestException('Se requiere una lista de transacciones válida');
        }
        try {
            const results = await this.paymentsService.reconcileTransactions(body.transactions, body.adminId);
            return {
                success: true,
                ...results
            };
        }
        catch (error) {
            this.logger.error('Error procesando conciliación bancaria', error);
            return {
                success: false,
                error: 'Error al procesar la conciliación: ' + error.message
            };
        }
    }
};
exports.ReconciliationController = ReconciliationController;
__decorate([
    (0, common_1.Post)('parse-pdf'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReconciliationController.prototype, "parsePdfStatement", null);
__decorate([
    (0, common_1.Post)('process'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReconciliationController.prototype, "processReconciliation", null);
exports.ReconciliationController = ReconciliationController = ReconciliationController_1 = __decorate([
    (0, common_1.Controller)('api/payments/reconciliation'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], ReconciliationController);
//# sourceMappingURL=reconciliation.controller.js.map