import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div className="relative z-10">
        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#4A6B53",
            },
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border border-[var(--outline)]/15 rounded-2xl bg-[var(--surface-container)]",
            },
          }}
        />
      </div>
    </div>
  );
}
