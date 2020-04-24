import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JWT } from 'jose';

@Injectable()
export class UserIdHeaderInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request: any = context.switchToHttp().getRequest();
        const token: string = (request.get('Authorization') as string).split(' ')[1].trim();

        let subject: string;

        try {
            const { sub } = JWT.decode(token) as Record<any, any>;

            subject = sub;
        } catch (e) {
            throw new UnauthorizedException();
        }

        request.headers = Object.assign({ 'x-user-id': subject }, request.headers);

        return next.handle();
    }
}
