import { Injectable, CanActivate, ExecutionContext, HttpService, UnauthorizedException, Inject, InternalServerErrorException } from '@nestjs/common';
import { JWKS, JWT } from 'jose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject('ConfigService')
        private readonly configService: ConfigService,
        @Inject('HttpService')
        private readonly httpService: HttpService
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request: any = context.switchToHttp().getRequest();
        const token: string = (request.get('Authorization') as string).split(' ')[1].trim();

        let jwks: any;

        try {
            const { data } = await this.httpService
                .get(`${this.configService.get('JWKS_URL')}/.well-known/jwks.json`, {
                    headers: { 'Content-Type': 'Application/json' }
                }).toPromise();

            jwks = data;
        } catch (e) {
            throw new InternalServerErrorException();
        }

        try {
            const keyStore = JWKS.asKeyStore(jwks);

            JWT.verify(token, keyStore, {
                profile: 'id_token',
                audience: this.configService.get('JWT_AUDIENCE'),
                issuer: this.configService.get('JWT_ISSUER'),
            });
        } catch (e) {
            throw new UnauthorizedException();
        }

        return true;
    }
}
