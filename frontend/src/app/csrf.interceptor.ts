import { HttpInterceptorFn } from '@angular/common/http';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (!mutatingMethods.includes(req.method.toUpperCase())) {
        return next(req);
    }

    const token = document.cookie
        .split('; ')
        .find((c) => c.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    const modifiedReq = token
        ? req.clone({
            headers: req.headers.set('X-XSRF-TOKEN', token),
        })
        : req;

    return next(modifiedReq);
};
