import { Controller, Post, UseInterceptors, UploadedFile, Body, Logger, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentsService } from './payments.service';
import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Controller('api/payments/reconciliation')
export class ReconciliationController {
  private readonly logger = new Logger(ReconciliationController.name);
  private genAI: GoogleGenerativeAI;

  constructor(private readonly paymentsService: PaymentsService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  @Post('parse-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async parsePdfStatement(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Archivo PDF requerido');
    }

    try {
      const pdfData = await pdfParse(file.buffer);
      const text = pdfData.text;

      if (!text || text.trim().length === 0) {
        throw new BadRequestException('El archivo PDF parece estar vacío o no contiene texto legible.');
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
    } catch (error) {
      this.logger.error('Error al parsear PDF bancario', error);
      return {
        success: false,
        error: 'No se pudo procesar el estado de cuenta bancario. Asegúrese de que el PDF sea legible.',
        details: error.message
      };
    }
  }

  @Post('process')
  async processReconciliation(
    @Body() body: { 
      transactions: Array<{ date?: string; description?: string; referenceNumber: string; amount: number }>;
      adminId?: string;
    }
  ) {
    if (!body.transactions || !Array.isArray(body.transactions)) {
      throw new BadRequestException('Se requiere una lista de transacciones válida');
    }

    try {
      const results = await this.paymentsService.reconcileTransactions(body.transactions, body.adminId);
      return {
        success: true,
        ...results
      };
    } catch (error) {
      this.logger.error('Error procesando conciliación bancaria', error);
      return {
        success: false,
        error: 'Error al procesar la conciliación: ' + error.message
      };
    }
  }
}
