import { signIn } from "@/auth";

export function LumioLoginForm() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F6F0] px-4 py-12 text-gray-900 font-sans selection:bg-[#E2ECE9] selection:text-[#162E29]">
      {/* Header Branding (Logo Removed) */}
      <div className="mb-9 flex flex-col items-center text-center">
        <h1 className="font-serif text-4xl font-extrabold tracking-tight text-[#162E29] sm:text-5xl">
          Lumio
        </h1>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#5C756F]">
          Clinical intelligence for mental health
        </p>
      </div>

      {/* Main Elevated White Login Card */}
      <div className="w-full max-w-md rounded-3xl border border-[#E4DDD3] bg-white p-9 shadow-lg shadow-black/[0.03] transition-all">
        <h2 className="text-2xl font-bold tracking-tight text-[#162E29]">Sign in</h2>

        <p className="mt-3 text-xs leading-relaxed text-gray-600">
          After signup, open your invite email and sign in with your Google Account to access your clinical portal, custom calendar, and meeting tools.
        </p>

        {/* Google Sign-In Action */}
        <div className="mt-7">
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <button
              type="submit"
              className="group relative flex w-full items-center justify-center space-x-3 rounded-2xl bg-[#162E29] py-4 px-5 text-sm font-semibold text-white shadow-md hover:bg-[#102420] active:scale-[0.99] transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#162E29] focus:ring-offset-2"
            >
              {/* Google G Logo */}
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>
        </div>

        {/* Security & HIPAA Trust Indicator */}
        <div className="mt-6 flex items-center justify-center space-x-1.5 rounded-xl bg-[#F6F3ED] py-2 px-3 text-[11px] font-medium text-[#49615B]">
          <svg className="h-3.5 w-3.5 text-[#2A524A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Secured with 256-bit encryption & OAuth 2.0</span>
        </div>

        {/* Footer Link */}
        <div className="mt-8 border-t border-[#F0EBE1] pt-6 text-center text-xs text-gray-500">
          <span>Don&apos;t have a Lumio account yet? </span>
          <br />
          <a href="#" className="mt-1 inline-block font-semibold text-[#162E29] hover:underline transition">
            Sign up as a clinician
          </a>
        </div>
      </div>
    </div>
  );
}
