// Browser-compatible TOTP service
export class TOTPService {
    static generateSecret(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        for (let i = 0; i < 16; i++) {
            secret += chars[array[i] % 32];
        }
        return secret;
    }

    static generateTOTP(secret: string): string {
        const time = Math.floor(Date.now() / 30000);
        return this.hotp(secret, time).toString().padStart(6, '0');
    }

    static verifyTOTP(secret: string, token: string): boolean {
        const time = Math.floor(Date.now() / 30000);
        // Check current time and ±1 window for clock drift
        for (let i = -1; i <= 1; i++) {
            const expectedToken = this.hotp(secret, time + i).toString().padStart(6, '0');
            if (expectedToken === token) {
                return true;
            }
        }
        return false;
    }

    static async generateQRCodeURL(secret: string, accountName: string, issuer: string = 'SecureOps'): Promise<string> {
        const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
    }

    private static hotp(secret: string, counter: number): number {
        const key = this.base32Decode(secret);
        const counterBytes = new ArrayBuffer(8);
        const counterView = new DataView(counterBytes);
        counterView.setUint32(4, counter, false);

        return this.hmacSha1(key, new Uint8Array(counterBytes));
    }

    private static base32Decode(encoded: string): Uint8Array {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = 0;
        let value = 0;
        let output = [];

        for (let i = 0; i < encoded.length; i++) {
            const char = encoded[i];
            const index = alphabet.indexOf(char.toUpperCase());
            if (index === -1) continue;

            value = (value << 5) | index;
            bits += 5;

            if (bits >= 8) {
                output.push((value >>> (bits - 8)) & 255);
                bits -= 8;
            }
        }

        return new Uint8Array(output);
    }

    private static async hmacSha1(key: Uint8Array, data: Uint8Array): Promise<number> {
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
        const hash = new Uint8Array(signature);
        
        const offset = hash[hash.length - 1] & 0xf;
        const code = ((hash[offset] & 0x7f) << 24) |
                    ((hash[offset + 1] & 0xff) << 16) |
                    ((hash[offset + 2] & 0xff) << 8) |
                    (hash[offset + 3] & 0xff);
        
        return code % 1000000;
    }
}