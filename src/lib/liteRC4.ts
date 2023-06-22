// Copyright (C) 2022 Theros < MisModding | SvalTek >
// 
// This file is part of MisCord2.
// 
// MisCord2 is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// MisCord2 is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with MisCord2.  If not, see <http://www.gnu.org/licenses/>.

/**
 * LiteARCFour
 * 
 * This is a lite version of RC4 encryption
 * ArcFour is a stream cipher, and is not a block cipher.
 * this means that it is not a good choice for encrypting
 * large amounts of data.
 * 
 * This is not secure, and should not be used for anything other than
 * a simple encryption when heavier encryption is not possible...
*/


type OutputEncoding = 'hex' | 'base64' | 'binary' | 'utf8' | 'ascii';
type InputEncoding = 'hex' | 'base64' | 'binary' | 'utf8' | 'ascii';

export class LiteRC4 {
    private i: number = 0;
    private j: number = 0;
    private s: number[] = [];

    constructor(key: string) {
        this.s = new Array(256);
        for (let i = 0; i < 256; i++) this.s[i] = i;
        let j = 0;
        for (let i = 0; i < 256; i++) {
            j = (j + this.s[i] + key.charCodeAt(i % key.length)) % 256;
            const temp = this.s[i];
            this.s[i] = this.s[j];
            this.s[j] = temp;
        }
    }

    public encrypt(data: string, outputEncoding: OutputEncoding = 'utf8') {
        let encrypted = '';
        return new Promise((resolve, reject) => {
            if (!data)
                return reject('No data to encrypt');
            if (typeof data !== 'string')
                return reject('Data is not a string');
            if (data.length === 0)
                return reject('Data is empty');
            for (let i = 0; i < data.length; i++) {
                this.i = (this.i + 1) % 256;
                this.j = (this.j + this.s[this.i]) % 256;
                const temp = this.s[this.i];
                this.s[this.i] = this.s[this.j];
                this.s[this.j] = temp;
                const t = (this.s[this.i] + this.s[this.j]) % 256;
                encrypted += String.fromCharCode(data.charCodeAt(i) ^ this.s[t]);
            }
            
            const result = Buffer.from(encrypted, 'utf8').toString(outputEncoding);
            resolve(result);
        });
    }
    
    public async decrypt(data: string, inputEncoding: InputEncoding = 'utf8') {
        try {
            const buffer = Buffer.from(data, inputEncoding);
            const plaintext = await this.encrypt(buffer.toString());
            return plaintext
        }
        catch (err) {
            throw err;
        }
    }

    public encryptBuffer(data: Buffer): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            if (!data) return reject('No data to encrypt');
            if (typeof data !== 'object') return reject('Data is not a buffer');
            if (data.length === 0) return reject('Data is empty');
            const result = Buffer.alloc(data.length);
            for (let i = 0; i < data.length; i++) {
                this.i = (this.i + 1) % 256;
                this.j = (this.j + this.s[this.i]) % 256;
                const temp = this.s[this.i];
                this.s[this.i] = this.s[this.j];
                this.s[this.j] = temp;
                const t = (this.s[this.i] + this.s[this.j]) % 256;
                result[i] = data[i] ^ this.s[t];
            }
            resolve(result);
        });
    }

    public async decryptBuffer(data: Buffer): Promise<Buffer> {
        return await this.encryptBuffer(data);
    }

    public async generate(count: number): Promise<Buffer> {
        const result = Buffer.alloc(count);
        return new Promise((resolve, reject) => {
            if (!count) return reject('No count provided');
            if (typeof count !== 'number') return reject('Count is not a number');
            for (let i = 0; i < count; i++) {
                this.i = (this.i + 1) % 256;
                this.j = (this.j + this.s[this.i]) % 256;
                const temp = this.s[this.i];
                this.s[this.i] = this.s[this.j];
                this.s[this.j] = temp;
                const t = (this.s[this.i] + this.s[this.j]) % 256;
                result[i] = this.s[t];
            }
            resolve(result);
        });
    }

    public async genKey(count: number) {
        const key = await this.generate(count);
        return key.toString('hex');
    }
}
