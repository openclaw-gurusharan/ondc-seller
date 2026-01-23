import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout, PageHeader } from '@drams-design/components';
import { config } from '@/config/env';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  useEffect(() => {
    const identityUrl = import.meta.env.VITE_IDENTITY_URL || config.identityUrl;
    const returnTo = encodeURIComponent(window.location.origin + returnUrl);
    window.location.href = `${identityUrl}/login?returnUrl=${returnTo}`;
  }, [returnUrl]);

  return (
    <PageLayout>
      <PageHeader title="Logging in..." />
      <p>Redirecting to login page...</p>
    </PageLayout>
  );
}
