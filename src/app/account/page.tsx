import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppLayout } from "@/components/layout/app-layout";
import AccountForm from "./account-form";

function AccountContent() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Account Settings
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Manage your profile and account preferences
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <AccountForm />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function Account() {
  return (
    <ProtectedRoute requireAuth={true}>
      <AccountContent />
    </ProtectedRoute>
  );
}
