// src/app/services/analytics.service.ts
import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { environment } from '../../src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private analytics = getAnalytics(initializeApp(environment.firebase));

    logEvent(eventName: string, params?: { [key: string]: any }) {
        logEvent(this.analytics, eventName, params);
    }
}
