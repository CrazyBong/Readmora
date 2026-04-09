import { AnimatedAuthPage } from '@/components/ui/animated-characters-login-page';

export const metadata = {
  title: 'Sign Up | Readmora',
  description: 'Join Readmora to start curating your beautifully designed digital reading shelf.',
};

export default function SignUpPage() {
  return <AnimatedAuthPage isSignUp={true} />;
}
