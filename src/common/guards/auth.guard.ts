import { Injectable, CanActivate, ExecutionContext, HttpService, UnauthorizedException, Inject, InternalServerErrorException } from '@nestjs/common';
import { JWKS, JWT, errors } from 'jose';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(@Inject('HttpService') private readonly httpService: HttpService) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request: any = context.switchToHttp().getRequest();
        const token: string = (request.get('Authorization') as string).split(' ')[1].trim();

        let jwks: any;

        try {
            const { data } = await this.httpService
                .get(`${process.env.JWKS_URL}/.well-known/jwks.json`, {
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
                audience: (process.env.JWT_AUDIENCE as string).split(','),
                issuer: process.env.JWT_ISSUER,
            });
        } catch (e) {
            throw new UnauthorizedException();
        }

        return true;
    }
}
