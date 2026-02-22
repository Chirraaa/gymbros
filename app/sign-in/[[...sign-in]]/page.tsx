import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🏋️</span>
          <span className="text-2xl font-black text-foreground">GymBros</span>
        </div>
        <SignIn />
      </div>
    </div>
  );
}