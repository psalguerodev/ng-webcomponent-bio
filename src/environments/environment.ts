// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  base_api: 'https://dpiuat.grupoib.local:7020',
  base_agent: 'https://localdev.uxagent.com:2223',
  base_biomatch: 'https://localhost:2222',
  assets_path: 'https://psalguero.sfo2.cdn.digitaloceanspaces.com',
  gategay_path: '/ibk/uat',
  bioConfig: {
    dniAuthorizer: '46025767',
    x_ibm_client_id: 'a668bb85-8159-4b03-bed6-a8a46380cc78'
  }
};

/*
    base_api: 'https://dpiuat.grupoib.local:7020',
    base_biomatch: 'https://localhost:2222',
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
