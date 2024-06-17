import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import {
  AppInsightsErrorBoundary,
  ReactPlugin
} from '@microsoft/applicationinsights-react-js';

import { VPhone } from './src/phone/VPhone';
import Phone from './src/phone/Phone2';
import { Container } from './src/components/Container';

VPhone.initBackground();

const reactPlugin = new ReactPlugin();
const appInsights = new ApplicationInsights({
  config: {
    connectionString:
      'InstrumentationKey=89ba4ad2-47ef-41e8-a151-4b3488132c63;IngestionEndpoint=https://westeurope-5.in.applicationinsights.azure.com/;LiveEndpoint=https://westeurope.livediagnostics.monitor.azure.com/',
    extensions: [reactPlugin]
  }
});
appInsights.loadAppInsights();
appInsights.trackPageView();

export default function App() {
  return (
    <AppInsightsErrorBoundary appInsights={reactPlugin} >
      <Container>
        <Phone />
      </Container>
    </AppInsightsErrorBoundary>
  );
}
