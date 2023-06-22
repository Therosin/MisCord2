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
import { base64_urlencode, base64_urldecode, createHmac265 } from './utils';

export interface JWTHeader {
    alg: string;
    typ: string;
    cty?: string;
}

export interface JWTBody {
    iss: string;
    sub?: string;
    aud?: string;
    exp: number;
    nbf: number;
    iat: number;
    jti: string;
    data?: {
        [key: string]: any;
    };
}

export interface JWTToken {
    header: JWTHeader;
    body: JWTBody;
    signature: string;
}

function encodeJWT(header: JWTHeader, body: JWTBody, secret: string): string {
    const headerEncoded = base64_urlencode(JSON.stringify(header));
    const bodyEncoded = base64_urlencode(JSON.stringify(body));
    const signature = createHmac265(`${headerEncoded}.${bodyEncoded}`, secret);
    return `${headerEncoded}.${bodyEncoded}.${signature}`;
}

function decodeJWT(token: string, raw: boolean = false): JWTToken {
    const [headerEncoded, bodyEncoded, signature] = token.split('.');
    const header = base64_urldecode(headerEncoded);
    const body = base64_urldecode(bodyEncoded);
    if (raw) {
        return {
            header: header as any,
            body: body as any,
            signature,
        };
    }
    return {
        header: JSON.parse(header) as JWTHeader,
        body: JSON.parse(body) as JWTBody,
        signature,
    };
}

function verifyJWT(token: string, secret: string): boolean {
    const { header, body, signature } = decodeJWT(token);
    const signature2 = createHmac265(`${base64_urlencode(JSON.stringify(header))}.${base64_urlencode(JSON.stringify(body))}`, secret);
    return signature === signature2;
}


export interface LiteJWTOptions {
    issuer?: string;
    subject?: string;
    audience?: string;
    expiration?: number;
}

export interface LiteJWTTokenOptions extends LiteJWTOptions {
    notBefore?: number;
    issuedAt?: number;
    data?: object;
    type?: string;
}


export class LiteJWT {
    private secret: string;
    private options: LiteJWTOptions;

    constructor(secret: string, options: LiteJWTOptions = {}) {
        this.secret = secret;
        this.options = {
            ...options,

        }
    }

    public createToken(options: LiteJWTTokenOptions): string {
        const header: JWTHeader = {
            alg: 'HS256',
            typ: options.type || 'LiteJWT',
        };

        const issueTime = options.issuedAt || Math.floor(Date.now() / 1000); // in seconds

        const body: JWTBody = {
            iss: options.issuer || this.options.issuer || 'LiteJWT',
            sub: options.subject || this.options.subject || 'LiteJWT',
            aud: options.audience || this.options.audience || 'LiteJWT',
            iat: issueTime,
            exp: issueTime + (options.expiration || this.options.expiration || 3600), // in seconds
            nbf: issueTime - 1000, // 1 second ago
            jti: Math.random().toString(36).substring(2),
            data: options.data || {},
        };
        return encodeJWT(header, body, this.secret);
    }

    public verifyToken(token: string): boolean {
        return verifyJWT(token, this.secret);
    }

    public decodeToken(token: string): JWTToken {
        return decodeJWT(token);
    }

}
