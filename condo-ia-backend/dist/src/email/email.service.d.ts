export declare class EmailService {
    private logger;
    private transporter;
    constructor();
    init(): Promise<void>;
    sendEmailWithAttachment(to: string, subject: string, text: string, pdfBuffer: Buffer, fileName: string): Promise<string | false | undefined>;
    sendEmail(to: string, subject: string, text: string): Promise<string | false | undefined>;
}
