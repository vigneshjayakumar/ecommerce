/// <reference types="@angular/localize" />

import { enableProdMode, isDevMode } from '@angular/core';

import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './app/auth/http-interceptor.service';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from './app/common/config/echarts.config';
import { provideServiceWorker } from '@angular/service-worker';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [provideRouter(appRoutes), provideHttpClient(withInterceptors([AuthInterceptor])), provideEchartsCore({
        echarts: () => Promise.resolve(echarts)
    }), provideServiceWorker('ngsw-worker.js', {
        enabled: true,
        registrationStrategy: 'registerWhenStable:30000'
    })],
}).catch((err) => console.log(err));
