import SocialOtherPlatform from '@/components/SocialOtherPlatform';
import SocialPlatform from '@/components/SocialPlatform';

const primaryPlatforms = new Set(['instagram', 'tiktok', 'x', 'youtube', 'spotify']);

export default async function SocialPlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform: rawPlatform } = await params;
  const platform = rawPlatform.toLowerCase();
  return primaryPlatforms.has(platform) ? <SocialPlatform slug={platform} /> : <SocialOtherPlatform slug={platform} />;
}
