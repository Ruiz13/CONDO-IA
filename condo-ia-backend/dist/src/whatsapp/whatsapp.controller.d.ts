import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    getStatus(): {
        connected: boolean;
    };
    getQrCode(): {
        error: string;
        qrImage?: undefined;
    } | {
        qrImage: string;
        error?: undefined;
    };
    logout(): Promise<{
        success: boolean;
        message: string;
    }>;
}
