import {
  InteractiveDashboard,
  MetabaseProvider,
  defineMetabaseAuthConfig,
} from "@metabase/embedding-sdk-react";

const apiKey = import.meta.env.VITE_METABASE_API_KEY;
/**
 * This creates an auth config to pass to the `MetabaseProvider` component.
 * You'll need to replace the `metabaseInstanceUrl` and the `apiKey` values.
 */
const authConfig = defineMetabaseAuthConfig({
  metabaseInstanceUrl: "http://localhost:3000",
  apiKey,
});

/**
 * Now embed your first dashboard. In this case, we're embedding the dashboard with ID 1.
 * On new Metabases, ID 1 will be the example dashboard, but feel free to use a different dashboard ID.
 */
export default function MetabaseComponent() {
  return (
    <MetabaseProvider authConfig={authConfig}>
      <InteractiveDashboard dashboardId={2} />
    </MetabaseProvider>
  );
}
