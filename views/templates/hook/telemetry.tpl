{if $recsync_telemetry_enabled}
<script>
    // RecSync Telemetry Configuration
    window.recsyncTelemetryEnabled = true;
    window.recsyncTelemetryUrl = '{$recsync_telemetry_url}';
    // Removed recsyncUserId to use only analytics.js centralized user_id
    window.recsyncSessionId = '{$recsync_session_id}';
</script>
{/if}
