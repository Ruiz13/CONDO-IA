export declare class WhatsappService {
    private readonly logger;
    private socket;
    qrCodeStr: string | null;
    isConnected: boolean;
    constructor();
    initWhatsapp(): Promise<void>;
    logout(): Promise<void>;
}
