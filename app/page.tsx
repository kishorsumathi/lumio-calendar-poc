import { auth } from "@/auth";
import { Navbar } from "@/components/Navbar";
import { CreateMeetingForm } from "@/components/CreateMeetingForm";
import { CustomCalendarView } from "@/components/CustomCalendarView";
import { LumioLoginForm } from "@/components/LumioLoginForm";
import { getCustomEvents } from "@/lib/events-db";

export default async function HomePage() {
  const session = await auth();
  const events = getCustomEvents();

  if (!session?.user) {
    return <LumioLoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar user={session.user} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <CreateMeetingForm />
            </div>

            <div className="lg:col-span-7">
              <CustomCalendarView events={events} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
