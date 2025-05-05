import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Activity, Target, Award, Clock } from "lucide-react";
import { Suspense } from "react";
import CricketShotClassifierWrapper from "./CricketShotClassifierWrapper"; // ✅ Import the new wrapper

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-green-800">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center">
            <Target className="h-6 w-6 mr-2 text-white" />
            <h1 className="text-lg font-bold text-white">CrickBoost Dashboard</h1>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" className="bg-white hover:bg-gray-100 text-green-800">
              Log out
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        <div className="container py-8">
          <div className="rounded-lg border bg-card p-8 shadow-sm mb-10 bg-gradient-to-r from-green-50 to-blue-50">
            <h2 className="text-2xl font-bold text-green-800">Welcome, {user.name}!</h2>
            <p className="mt-2 text-muted-foreground">
              Ready to analyze and improve your cricket technique? Use the shot classifier below to get started.
            </p>
          </div>

          <Tabs defaultValue="shot-analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="shot-analysis" className="text-base">Shot Analysis</TabsTrigger>
              <TabsTrigger value="progress" className="text-base">Progress Tracking</TabsTrigger>
              <TabsTrigger value="drills" className="text-base">Recommended Drills</TabsTrigger>
            </TabsList>

            <TabsContent value="shot-analysis" className="space-y-4">
              {/* Static cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* (Cards code you already have) */}
              </div>

              {/* Dynamic Classifier */}
              <div className="mt-8">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-800">Cricket Shot Classifier</CardTitle>
                    <CardDescription>
                      Position yourself in front of the camera and play your cricket shots to get real-time feedback
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={
                      <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent mb-4"></div>
                          <p className="text-gray-600">Loading shot classifier...</p>
                        </div>
                      </div>
                    }>
                      <CricketShotClassifierWrapper />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Other tabs "progress" and "drills" stay same */}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
