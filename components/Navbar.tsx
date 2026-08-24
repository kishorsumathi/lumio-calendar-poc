import { signIn, signOut } from "@/auth";
import { UserAvatar } from "@/components/UserAvatar";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Navbar({ user }: NavbarProps) {
  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md">
            GC
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Custom Calendar & Meet Generator</h1>
            <p className="text-xs text-gray-500">Google OAuth & Dual-Calendar Sync POC</p>
          </div>
        </div>

        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-1.5 shadow-2xs">
                <UserAvatar name={user.name} image={user.image} />
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-900">{user.name}</p>
                  <p className="text-[11px] text-gray-500 font-medium">{user.email}</p>
                </div>
              </div>

              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <button
                type="submit"
                className="flex items-center space-x-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C6.721,2,2,6.721,2,12.545S6.721,23.09,12.545,23.09c6.627,0,10.978-4.658,10.978-11.171c0-0.748-0.076-1.309-0.183-1.68H12.545z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
}
