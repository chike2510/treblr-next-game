import SocialPlatform from '@/components/SocialPlatform';

export default async function SocialPlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform: rawPlatform } = await params;
  const platform = rawPlatform.toLowerCase();
  return <SocialPlatform slug={platform} />;
}
