import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/components/app/app.component';
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { environment } from "./environments/environment";

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

const app = initializeApp(environment.firebase);
const analytics = getAnalytics(app);

logEvent(analytics, 'select_content', {
  content_type: 'year',
  item_id: '1994'
});
